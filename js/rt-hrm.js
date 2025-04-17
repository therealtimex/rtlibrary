         const $=id=>document.getElementById(id);
         const monthTitle=$('month-title');
         const weekTitle=$('week-title');
         const weekView=$('week-view');
         const calendarView=$('calendar-view');
         const loadingElem=$('loading');
         const errorElem=$('error');
         const expandToggle=$('expand-toggle');
         const modalOverlay=$('modal-overlay');
         const eventModal=$('event-modal');
         const modalTitle=$('modal-title');
         const modalContent=$('modal-content');
         const closeModal=$('close-modal');
         const prevMonthBtn=$('prev-month');
         const nextMonthBtn=$('next-month');
         const prevWeekBtn=$('prev-week');
         const nextWeekBtn=$('next-week');
         const lastCheckinTime=$('last-checkin-time');
         const statusIndicator=$('status-indicator');
         const viewHistoryBtn=$('view-history');
         const monthHeader=document.querySelector('.month-header');
         const weekHeader=document.querySelector('.week-header');
         let currentDate=new Date();
         let weekStartDate=new Date(currentDate);
         let currentMonth=currentDate.getMonth();
         let currentYear=currentDate.getFullYear();
         let isMonthView=false;
         let attendanceData=[];
         let leaveData=[];
         let holidayData=[];
         let zeroWorkData=[];
         let latestCheckin=null;
         adjustToMonday(weekStartDate);
         const monthNames=["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
         const weekdayNames=["CN","Th2","Th3","Th4","Th5","Th6","Th7"];
         function formatDate(dateString){
         if(!dateString)return'N/A';
         const parts=dateString.split('-');
         if(parts.length!==3)return dateString;
         return`${parts[2]}/${parts[1]}/${parts[0]}`;
         }
         function formatDateWithWeekday(date){
         const day=date.getDate().toString().padStart(2,'0');
         const month=(date.getMonth()+1).toString().padStart(2,'0');
         const year=date.getFullYear();
         const weekday=weekdayNames[date.getDay()];
         return`${weekday} ${day}/${month}/${year}`;
         }
         function adjustToMonday(date){
         const day=date.getDay();
         const diff=date.getDate()-day+(day===0?-6:1);
         date.setDate(diff);
         return date;
         }
         function updateWeekTitle(){
         const weekEnd=new Date(weekStartDate);
         weekEnd.setDate(weekStartDate.getDate()+6);
         const startDay=weekStartDate.getDate().toString().padStart(2,'0');
         const startMonth=(weekStartDate.getMonth()+1).toString().padStart(2,'0');
         const endDay=weekEnd.getDate().toString().padStart(2,'0');
         const endMonth=(weekEnd.getMonth()+1).toString().padStart(2,'0');
         weekTitle.textContent=`Tuần ${startDay}/${startMonth} - ${endDay}/${endMonth}`;
         }
         function formatCheckInTime(timeString){
         if(!timeString)return'N/A';
         try{
         const date=new Date(timeString);
         const weekday=weekdayNames[date.getDay()];
         const day=date.getDate().toString().padStart(2,'0');
         const month=(date.getMonth()+1).toString().padStart(2,'0');
         const year=date.getFullYear();
         const hours=date.getHours().toString().padStart(2,'0');
         const minutes=date.getMinutes().toString().padStart(2,'0');
         return`${weekday} ${day}/${month}/${year} ${hours}:${minutes}`;
         }catch(error){
         return timeString;
         }
         }
         async function fetchData(){
         showLoading(true);
         errorElem.style.display='none';
         try{
         const[attendanceResponse,leaveResponse,holidayResponse]=await Promise.all([
         fetch('https://es.rta.vn/hr_checkinout_list_v4/_search',{
         method:'POST',
         headers:{'Content-Type':'application/json'},
         body:JSON.stringify({
         "size":10000,
         "collapse":{"field":"keyid_ins.raw"},
         "_source":{"includes":["rta_time_fm","view_mark","view_mark_lb","erp_salary_unit","chkin_time","chkout_time","erp_shift_lb","rta_date","hr_month","hr_year","nb_count","keyid_ins","erp_shift_id","rta_shift_id","chkin_time_fm","shift_lb_en","shift_lb_vi"]},
         "query":{"bool":{"must":[
         {"term":{"project_code.raw":{"value":"C026"}}},
         {"term":{"username.raw":{"value":"rta_phuongtran"}}},
         {"range":{"hr_year":{"gte":"now/y"}}}
         ]}},
         "sort":[{"endtime":{"order":"desc"}}]
         })
         }),
         fetch('https://es.rta.vn/hr_leave_tracking_v5/_search',{
         method:'POST',
         headers:{'Content-Type':'application/json'},
         body:JSON.stringify({
         "size":10000,
         "collapse":{"field":"keyid_ins.raw"},
         "_source":{"includes":["leave_status_id","erp_shift_lb","rta_date","hr_month","hr_year","nb_count","keyid_ins","rta_loainghi"]},
         "query":{"bool":{"must":[
         {"term":{"project_code.raw":{"value":"C026"}}},
         {"term":{"username.raw":{"value":"rta_phuongtran"}}},
         {"range":{"hr_year":{"gte":"now/y"}}}
         ]}},
         "sort":[{"endtime":{"order":"desc"}}]
         })
         }),
         fetch('https://es.rta.vn/erp_holiday/_search',{
         method:'POST',
         headers:{'Content-Type':'application/json'},
         body:JSON.stringify({
         "size":10000,
         "collapse":{"field":"keyid_ins.raw"},
         "_source":{"includes":["erp_holiday_status_id","erp_holiday_lb","erp_shift_lb","rta_date","hr_month","hr_year","nb_count","keyid_ins"]},
         "query":{"bool":{"must":[
         {"range":{"nb_count":{"gt":"0"}}},
         {"term":{"project_code.raw":{"value":"C026"}}}
         ]}},
         "sort":[{"endtime":{"order":"desc"}}]
         })
         })
         ]);
         const[attendanceResult,leaveResult,holidayResult]=await Promise.all([
         attendanceResponse.json(),
         leaveResponse.json(),
         holidayResponse.json()
         ]);
         attendanceData=attendanceResult.hits?attendanceResult.hits.hits.map(hit=>hit._source):[];
         leaveData=leaveResult.hits?leaveResult.hits.hits.map(hit=>hit._source):[];
         holidayData=holidayResult.hits?holidayResult.hits.hits.map(hit=>hit._source):[];
         attendanceData=attendanceData.filter(item=>item.erp_salary_unit==1);
         leaveData=leaveData.filter(item=>[1,2,3,4,6].includes(parseInt(item.leave_status_id||0)));
         holidayData=holidayData.filter(item=>item.erp_holiday_status_id==1);
         leaveData=leaveData.filter(item=>parseFloat(item.nb_count||0)>0);
         latestCheckin=findLatestCheckin(attendanceData);
         updateLastCheckinInfo(latestCheckin);
         updateAttendanceActions();
         calculateZeroWorkDays();
         showLoading(false);
         if(attendanceData.length===0&&leaveData.length===0&&holidayData.length===0){
         errorElem.textContent='Không tìm thấy dữ liệu chấm công cho năm hiện tại.';
         errorElem.style.display='block';
         return;
         }
         renderCalendar();
         }catch(error){
         showLoading(false);
         errorElem.textContent=`Lỗi: ${error.message}. Vui lòng thử lại sau.`;
         errorElem.style.display='block';
         }
         }
         function findLatestCheckin(data){
         if(!data||data.length===0)return null;
         const sorted=[...data].sort((a,b)=>{
         const timeA=a.rta_time_fm?new Date(a.rta_time_fm).getTime():0;
         const timeB=b.rta_time_fm?new Date(b.rta_time_fm).getTime():0;
         return timeB-timeA;
         });
         return sorted[0];
         }
         function updateLastCheckinInfo(checkin){
         if(!checkin){
         lastCheckinTime.textContent='N/A';
         statusIndicator.className='status-indicator';
         return;
         }
         lastCheckinTime.textContent=formatCheckInTime(checkin.rta_time_fm);
         statusIndicator.className='status-indicator';
         const viewMark=parseInt(checkin.view_mark||0);
         if(viewMark===1){statusIndicator.classList.add('status-green');}
         else if(viewMark===2){statusIndicator.classList.add('status-blue');}
         else if(viewMark===3){statusIndicator.classList.add('status-red');}
         }
         function calculateZeroWorkDays(){
         zeroWorkData=[];
         const year=currentYear;
         const month=currentMonth;
         const daysInMonth=new Date(year,month+1,0).getDate();
         for(let day=1;day<=daysInMonth;day++){
         const date=new Date(year,month,day);
         const dayOfWeek=date.getDay();
         if(dayOfWeek===0||dayOfWeek===6){
         const formattedDay=day.toString().padStart(2,'0');
         const formattedMonth=(month+1).toString().padStart(2,'0');
         const formattedDate=`${year}-${formattedMonth}-${formattedDay}`;
         const hasAttendance=attendanceData.some(item=>item.rta_date===formattedDate);
         const hasLeave=leaveData.some(item=>item.rta_date===formattedDate);
         const hasHoliday=holidayData.some(item=>item.rta_date===formattedDate);
         if(!hasAttendance&&!hasLeave&&!hasHoliday){
         zeroWorkData.push({
         rta_date:formattedDate,
         hr_month:month+1,
         hr_year:year,
         nb_count:"0"
         });
         }
         }
         }
         }
         function showLoading(show){loadingElem.style.display=show?'block':'none';}
         function renderCalendar(){
         updateMonthTitle();
         updateWeekTitle();
         if(isMonthView){renderMonthView();}
         else{renderWeekView();}
         }
         function updateMonthTitle(){monthTitle.textContent=`${monthNames[currentMonth]}, ${currentYear}`;}
         function renderWeekView(){
         weekView.innerHTML='';
         for(let i=0;i<7;i++){
         const date=new Date(weekStartDate);
         date.setDate(weekStartDate.getDate()+i);
         const dayCell=createDayCell(date);
         weekView.appendChild(dayCell);
         }
         }
         function renderMonthView(){
         weekView.innerHTML='';
         const firstDay=new Date(currentYear,currentMonth,1);
         const lastDay=new Date(currentYear,currentMonth+1,0);
         const daysInMonth=lastDay.getDate();
         let firstDayOfWeek=firstDay.getDay()||7;
         for(let i=1;i<firstDayOfWeek;i++){
         const emptyCell=document.createElement('div');
         emptyCell.className='day-cell empty';
         weekView.appendChild(emptyCell);
         }
         for(let i=1;i<=daysInMonth;i++){
         const date=new Date(currentYear,currentMonth,i);
         const dayCell=createDayCell(date);
         weekView.appendChild(dayCell);
         }
         const lastDayOfWeek=lastDay.getDay()||7;
         for(let i=lastDayOfWeek+1;i<=7;i++){
         const emptyCell=document.createElement('div');
         emptyCell.className='day-cell empty';
         weekView.appendChild(emptyCell);
         }
         }
         function createDayCell(date){
         const cell=document.createElement('div');
         cell.className='day-cell';
         const today=new Date();
         if(date.getDate()===today.getDate()&&date.getMonth()===today.getMonth()&&date.getFullYear()===today.getFullYear()){
         cell.classList.add('today');
         }
         if(date.getMonth()!==currentMonth){
         cell.classList.add('empty');
         return cell;
         }
         const dayNumber=document.createElement('div');
         dayNumber.className='day-number';
         dayNumber.textContent=date.getDate();
         cell.appendChild(dayNumber);
         const formattedDay=date.getDate().toString().padStart(2,'0');
         const formattedMonth=(date.getMonth()+1).toString().padStart(2,'0');
         const formattedDate=`${date.getFullYear()}-${formattedMonth}-${formattedDay}`;
         const eventDots=document.createElement('div');
         eventDots.className='event-dots';
         cell.appendChild(eventDots);
         const attendanceEvents=filterEventsByDate(attendanceData,formattedDate);
         const leaveEvents=filterEventsByDate(leaveData,formattedDate);
         const holidayEvents=filterEventsByDate(holidayData,formattedDate);
         const zeroEvents=filterEventsByDate(zeroWorkData,formattedDate);
         if(attendanceEvents.length>0){
         addEventDot(eventDots,'attendance',calculateTotalCount(attendanceEvents));
         }
         if(leaveEvents.length>0){
         addEventDot(eventDots,'leave',calculateTotalCount(leaveEvents));
         }
         if(holidayEvents.length>0){
         addEventDot(eventDots,'holiday',calculateTotalCount(holidayEvents));
         }
         if(zeroEvents.length>0&&(attendanceEvents.length>0||leaveEvents.length>0||holidayEvents.length>0)){
         addEventDot(eventDots,'zero',0);
         }
         if(attendanceEvents.length>0||leaveEvents.length>0||holidayEvents.length>0||zeroEvents.length>0){
         cell.addEventListener('click',()=>{
         showEventDetails(formattedDate,attendanceEvents,leaveEvents,holidayEvents);
         });
         }
         return cell;
         }
         function filterEventsByDate(events,dateString){
         return events.filter(event=>event.rta_date===dateString);
         }
         function calculateTotalCount(events){
         return events.reduce((total,event)=>{
         return total+parseFloat(event.nb_count||0);
         },0).toFixed(1);
         }
         function addEventDot(container,type,count){
         if(type==='zero'||parseFloat(count)<=0){return;}
         const dot=document.createElement('div');
         dot.className=`event-dot ${type}`;
         dot.textContent=count;
         container.appendChild(dot);
         }
         function showEventDetails(date,attendanceEvents,leaveEvents,holidayEvents){
         const formattedDate=formatDate(date);
         modalTitle.textContent=`Chi tiết ngày ${formattedDate}`;
         let content='';
         if(attendanceEvents.length>0){
         content+=`<div class="event-list"><h4>Chấm công</h4>`;
         attendanceEvents.forEach(event=>{
         content+=`
         <div class="event-item">
         <div class="event-header">
         <span class="event-title">${event.erp_shift_lb||'Chấm công'}</span>
         <span class="event-count">${event.nb_count||'0'} công</span>
         </div>
         <div class="event-details">
         Check-in: ${event.chkin_time||'N/A'} - Check-out: ${event.chkout_time||'N/A'}
         </div>
         </div>
         `;
         });
         content+=`</div>`;
         }
         if(leaveEvents.length>0){
         content+=`<div class="event-list"><h4>Nghỉ phép</h4>`;
         leaveEvents.forEach(event=>{
         content+=`
         <div class="event-item">
         <div class="event-header">
         <span class="event-title">${event.erp_shift_lb||'Nghỉ phép'}</span>
         <span class="event-count">${event.nb_count||'0'} công</span>
         
         </div>
         </div>
         `;
         });
         content+=`</div>`;
         }
         if(holidayEvents.length>0){
         content+=`<div class="event-list"><h4>Nghỉ lễ</h4>`;
         holidayEvents.forEach(event=>{
         content+=`
         <div class="event-item">
         <div class="event-header">
         <span class="event-title">${event.erp_holiday_lb||'Nghỉ lễ'}</span>
         <span class="event-count">${event.nb_count||'0'} công</span>
         </div>
         <div class="event-details">
         ${event.erp_shift_lb||''}
         </div>
         </div>
         `;
         });
         content+=`</div>`;
         }
         modalContent.innerHTML=content;
         modalOverlay.style.display='block';
         eventModal.style.display='block';
         }
         function toggleView(){
         isMonthView=!isMonthView;
         if(isMonthView){
         expandToggle.textContent='▲ Thu gọn';
         calendarView.style.maxHeight='800px';
         monthHeader.style.display='flex';
         weekHeader.style.display='none';
         }else{
         expandToggle.textContent='▼ Xem thêm';
         calendarView.style.maxHeight='150px';
         monthHeader.style.display='none';
         weekHeader.style.display='flex';
         }
         renderCalendar();
         }
         function goToPrevMonth(){
         currentMonth--;
         if(currentMonth<0){
         currentMonth=11;
         currentYear--;
         }
         fetchData();
         }
         function goToNextMonth(){
         currentMonth++;
         if(currentMonth>11){
         currentMonth=0;
         currentYear++;
         }
         fetchData();
         }
         function goToPrevWeek(){
         weekStartDate.setDate(weekStartDate.getDate()-7);
         currentMonth=weekStartDate.getMonth();
         currentYear=weekStartDate.getFullYear();
         updateWeekTitle();
         renderWeekView();
         }
         function goToNextWeek(){
         weekStartDate.setDate(weekStartDate.getDate()+7);
         currentMonth=weekStartDate.getMonth();
         currentYear=weekStartDate.getFullYear();
         updateWeekTitle();
         renderWeekView();
         }
         function viewCheckinHistory(){
         var json='{\"type\":\"act_dm_view\",\"alias\":\"t72ep_t72ep01a1\",\"post\":\"{\\\"size\\\":300,\\\"collapse\\\":{\\\"field\\\":\\\"key_ins.raw\\\"},\\\"query\\\":{\\\"bool\\\":{\\\"must\\\":[{\\\"term\\\":{\\\"project_code.raw\\\":{\\\"value\\\":\\\"C026\\\"}}},{\\\"term\\\":{\\\"username.raw\\\":{\\\"value\\\":\\\"rta_phuongtran\\\"}}},{\\\"range\\\":{\\\"rta_date\\\":{\\\"gt\\\":\\\"2024-12-31\\\"}}}]}},\\\"sort\\\":[{\\\"endtime\\\":{\\\"order\\\":\\\"desc\\\"}}]}\"}';
         App.callActionButton(json);
         }
         expandToggle.addEventListener('click',toggleView);
         prevMonthBtn.addEventListener('click',goToPrevMonth);
         nextMonthBtn.addEventListener('click',goToNextMonth);
         prevWeekBtn.addEventListener('click',goToPrevWeek);
         nextWeekBtn.addEventListener('click',goToNextWeek);
         viewHistoryBtn.addEventListener('click',viewCheckinHistory);
         closeModal.addEventListener('click',()=>{
         modalOverlay.style.display='none';
         eventModal.style.display='none';
         });
         modalOverlay.addEventListener('click',()=>{
         modalOverlay.style.display='none';
         eventModal.style.display='none';
         });
         document.addEventListener('DOMContentLoaded',()=>{fetchData();});
         function renderAttendanceActions(view_mark){
         const container=document.getElementById('attendance-action-container');
         container.innerHTML='';
         let title='';
         let buttons=[];
         const BTN={
         checkin_qr:{
         label:'Tại văn phòng',
         icon:`<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="6" height="6" stroke="currentColor" stroke-width="2" rx="2"/><rect x="15" y="3" width="6" height="6" stroke="currentColor" stroke-width="2" rx="2"/><rect x="3" y="15" width="6" height="6" stroke="currentColor" stroke-width="2" rx="2"/><rect x="9" y="9" width="6" height="6" fill="currentColor" fill-opacity="0.12"/><rect x="17" y="17" width="2" height="2" fill="currentColor"/><rect x="13" y="17" width="2" height="2" fill="currentColor"/><rect x="17" y="13" width="2" height="2" fill="currentColor"/></svg>`,
         onClick:function(){
         if(!latestCheckin)return;
         const json={
         actionID:1,
         orderNumber:1,
         type:"act_fill_form",
         familyID:"HR_CHECKIN",
         tracking_id:"tag_chkin_btn",
         override_ui_behavior:{
         timeout:20,
         behavior:"disable"
         },
         preload:[
         {key:"time_txt",value:latestCheckin.rta_time_fm||""},
         {key:"rta_type",value:"1"}
         ]
         };
         App.callActionButton(JSON.stringify(json));
         }
         },
         checkin_remote:{
         label:'Từ xa',
         icon:`<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.12"/><ellipse cx="12" cy="12" rx="7" ry="9" stroke="currentColor" stroke-width="2"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2"/><line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" stroke-width="2"/></svg>`,
         onClick:function(){
         if(!latestCheckin)return;
         const json={
         actionID:3,
         orderNumber:1,
         type:"act_fill_form",
         familyID:"HR_CHECKIN",
         tracking_id:"tag_chkin_btn",
         override_ui_behavior:{
         timeout:20,
         behavior:"disable"
         },
         imageUrl:"rta://icon/bootstrap/globe?color=__COLOR_THEME_PRIMARY__",
         preload:[
         {key:"time_txt",value:latestCheckin.rta_time_fm||""},
         {key:"rta_type",value:"2"}
         ]
         };
         App.callActionButton(JSON.stringify(json));
         }
         },
         checkin_temp:{
         label:'Tạm thời',
         icon:`<i class="fa fa-hourglass-half attendance-btn-icon"></i>`,
         onClick:function(){
         if(!latestCheckin)return;
         const json={
         actionID:7,
         orderNumber:1,
         type:"act_fill_form",
         familyID:"HR_CHECKIN",
         tracking_id:"tag_chkin_btn",
         override_ui_behavior:{
         timeout:20,
         behavior:"disable"
         },
         openArgs:{
         erp_shift_id:latestCheckin.erp_shift_id||"",
         rta_shift_id:latestCheckin.rta_shift_id||"",
         rta_datetime_in:latestCheckin.chkin_time_fm||""
         },
         preload:[
         {key:"rta_type",value:"3"},
         {key:"shift_lb_en",value:latestCheckin.shift_lb_en||""},
         {key:"shift_lb_vi",value:latestCheckin.shift_lb_vi||""},
         {key:"time_txt",value:latestCheckin.rta_time_fm||""}
         ]
         };
         App.callActionButton(JSON.stringify(json));
         }
         },
         checkout_qr:{
         label:'QR',
         icon:`<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="6" height="6" stroke="currentColor" stroke-width="2" rx="2"/><rect x="15" y="3" width="6" height="6" stroke="currentColor" stroke-width="2" rx="2"/><rect x="3" y="15" width="6" height="6" stroke="currentColor" stroke-width="2" rx="2"/><rect x="9" y="9" width="6" height="6" fill="currentColor" fill-opacity="0.12"/><rect x="17" y="17" width="2" height="2" fill="currentColor"/><rect x="13" y="17" width="2" height="2" fill="currentColor"/><rect x="17" y="13" width="2" height="2" fill="currentColor"/></svg>`,
         onClick:function(){
         if(!latestCheckin)return;
         const json={
         actionID:2,
         orderNumber:1,
         type:"act_fill_form",
         familyID:"HR_CHECKOUT",
         tracking_id:"tag_chkout_btn",
         override_ui_behavior:{
         timeout:20,
         behavior:"disable"
         },
         openArgs:{
         erp_shift_id:latestCheckin.erp_shift_id||"",
         rta_shift_id:latestCheckin.rta_shift_id||"",
         rta_datetime_in:latestCheckin.chkin_time_fm||""
         },
         preload:[
         {key:"rta_type",value:"1"},
         {key:"shift_lb_en",value:latestCheckin.shift_lb_en||""},
         {key:"shift_lb_vi",value:latestCheckin.shift_lb_vi||""},
         {key:"time_txt",value:latestCheckin.rta_time_fm||""}
         ]
         };
         App.callActionButton(JSON.stringify(json));
         }
         },
         checkout_remote:{
         label:'Từ xa',
         icon:`<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 48 48" fill="none"><path d="M24 6C16.268 6 10 12.268 10 20c0 7.732 10.5 18 14 21.5C27.5 38 38 27.732 38 20c0-7.732-6.268-14-14-14Z" stroke="currentColor" stroke-width="3" fill="none"/><circle cx="24" cy="20" r="5" stroke="currentColor" stroke-width="3" fill="none"/><path d="M34 41a10 4 0 1 1-20 0" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
         onClick:function(){
         if(!latestCheckin)return;
         const json={
         actionID:4,
         orderNumber:1,
         type:"act_fill_form",
         familyID:"HR_CHECKOUT",
         tracking_id:"tag_chkout_btn",
         override_ui_behavior:{
         timeout:20,
         behavior:"disable"
         },
         openArgs:{
         erp_shift_id:latestCheckin.erp_shift_id||"",
         rta_shift_id:latestCheckin.rta_shift_id||"",
         rta_datetime_in:latestCheckin.chkin_time_fm||""
         },
         preload:[
         {key:"rta_type",value:"2"},
         {key:"shift_lb_en",value:latestCheckin.shift_lb_en||""},
         {key:"shift_lb_vi",value:latestCheckin.shift_lb_vi||""},
         {key:"time_txt",value:latestCheckin.rta_time_fm||""}
         ]
         };
         App.callActionButton(JSON.stringify(json));
         }
         },
         checkout_temp:{
         label:'Tạm thời',
         icon:`<i class="fa fa-clock-o attendance-btn-icon"></i>`,
         onClick:function(){
         if(!latestCheckin)return;
         const json={
         actionID:8,
         orderNumber:1,
         type:"act_fill_form",
         familyID:"HR_CHECKOUT",
         tracking_id:"tag_chkout_btn",
         override_ui_behavior:{
         timeout:20,
         behavior:"disable"
         },
         openArgs:{
         erp_shift_id:latestCheckin.erp_shift_id||"",
         rta_shift_id:latestCheckin.rta_shift_id||"",
         rta_datetime_in:latestCheckin.chkin_time_fm||""
         },
         preload:[
         {key:"rta_type",value:"3"},
         {key:"shift_lb_en",value:latestCheckin.shift_lb_en||""},
         {key:"shift_lb_vi",value:latestCheckin.shift_lb_vi||""},
         {key:"time_txt",value:latestCheckin.rta_time_fm||""}
         ]
         };
         App.callActionButton(JSON.stringify(json));
         }
         }
         };
         if(view_mark==1){
         title='Check-Out';
         buttons=[BTN.checkout_qr,BTN.checkout_remote,BTN.checkout_temp];
         }else if(view_mark==3){
         title='Check-In';
         buttons=[BTN.checkin_qr,BTN.checkin_remote];
         }else if(view_mark==2){
         title='Check-In';
         buttons=[BTN.checkin_temp];
         }
         if(title){
         container.innerHTML+=`<div class="attendance-action-title" style="color:#222;font-weight:bold;font-size:16px;padding-left:14px">${title}</div>`;
         }
         if(buttons.length){
         let html=`<div class="attendance-action-buttons">`;
         buttons.forEach((btn,idx)=>{
         html+=`<button class="attendance-btn" type="button" onclick="attendanceButtonHandlers[${idx}]()">
         <div class="attendance-btn-icon-bg">${btn.icon}</div>
         <span class="attendance-btn-label">${btn.label}</span>
         </button>`;
         });
         html+=`</div>`;
         container.innerHTML+=html;
         window.attendanceButtonHandlers=buttons.map(btn=>btn.onClick);
         }
         }
         function updateAttendanceActions(){
         const view_mark=latestCheckin?Number(latestCheckin.view_mark):0;
         renderAttendanceActions(view_mark);
         }
         updateAttendanceActions();
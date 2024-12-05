function initDebtChart(groupData) {
    data = groupData;
    raw = JSON.parse(data).buckets;
	// document.write(data)
    
    delete (cutomdtaset);
    cutomdtaset = [];
    date_ls0 = [];
    total_ls2 = [];

    date_ls0 = raw.map(x => `"` + x.key + `"`).join(`,`);
    date_ls0 = `[` + date_ls0 + `]`;
    date_ls0 = JSON.parse(date_ls0).filter((v, i, a) => a.indexOf(v) === i);
    date_ls0 = date_ls0.map(x => `"` + x + `"`).join(`,`);
    date_ls0 = `[` + date_ls0 + `]`;

    function compare2(a, b) {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }
    date_ls0 = JSON.parse(date_ls0).sort(compare2);

    function compare(a, b) {
        if (a.key < b.key) return -1;
        if (a.key > b.key) return 1;
        return 0;
    }

    tmp = raw.filter(function (x) {
        return x.doc_count > 0
    });
    tmp = tmp.sort(compare);

    total_ls = [];
    paid_ls = [];
    notice_ls = [];
    remained_ls = [];

    for (let z = 0; z < date_ls0.length; z++) {
        var content_tmp = tmp.filter(function (x) {
            return x.key == date_ls0[z]
        });
        if (content_tmp.length > 0) {
            total_point = content_tmp[0].cur.buckets.map(function (x) { if (x.key == 'U_057') { return x.total.value * 1 } else { return x.total.value } }).reduce((a, b) => a + b, 0);
            total_ls.push(total_point);
            paid_point = content_tmp[0].cur.buckets.map(function (x) { if (x.key == 'U_057') { return x.paid.value * 1 } else { return x.paid.value } }).reduce((a, b) => a + b, 0);
            paid_ls.push(paid_point);
            notice_point = content_tmp[0].cur.buckets.map(function (x) { if (x.key == 'U_057') { return x.notice.value * 1 } else { return x.notice.value } }).reduce((a, b) => a + b, 0);
            notice_ls.push(notice_point);
            remained_point = total_point - paid_point;
            remained_ls.push(remained_point);
        } else {
            total_ls.push(0);
            paid_ls.push(0);
            notice_ls.push(0);
            remained_ls.push(0);
        }
    }

    let a1 = 0, b1 = 0, c1 = 0, d1 = 0;
    total_ls01 = total_ls.map(x => ({ ...x, "cumsum": a1 += x }));
    total_ls = total_ls01.map(x => x.cumsum);
    paid_ls01 = paid_ls.map(x => ({ ...x, "cumsum": b1 += x }));
    paid_ls = paid_ls01.map(x => x.cumsum);
    notice_ls01 = notice_ls.map(x => ({ ...x, "cumsum": c1 += x }));
    notice_ls = notice_ls01.map(x => x.cumsum);
    remained_ls01 = remained_ls.map(x => ({ ...x, "cumsum": d1 += x }));
    remained_ls = remained_ls01.map(x => x.cumsum);

    corlor_ls = ['#00bbf9', '#00bbf9'];
    corlor_ls2 = ['#ef476f', '#ef476f'];
    corlor_ls3 = ['#009688', '#009688'];
    corlor_ls4 = ['#ff9800', '#ff9800'];

    cutomdtaset.push(`{"label": "Phải thu","backgroundColor": "${corlor_ls[0]}","borderColor": "${corlor_ls[1]}","data": [${String(total_ls)}],"tension": 0.4}`);
    cutomdtaset.push(`{"label": "Đã thu","backgroundColor": "${corlor_ls2[0]}","borderColor": "${corlor_ls2[1]}","data": [${String(paid_ls)}],"tension": 0.4}`);
    cutomdtaset.push(`{"label": "Báo thu","backgroundColor": "${corlor_ls3[0]}","borderColor": "${corlor_ls3[1]}","data": [${String(notice_ls)}],"tension": 0.4}`);
    cutomdtaset.push(`{"label": "Còn lại","backgroundColor": "${corlor_ls4[0]}","borderColor": "${corlor_ls4[1]}","data": [${String(remained_ls)}],"tension": 0.4}`);

    cutomdtaset = `[${cutomdtaset}]`;

    var canvas = document.getElementById('myChart2');
    var data2 = {
        labels: date_ls0,
        datasets: JSON.parse(cutomdtaset)
    };
    var options = {
        responsive: true,
        interaction: {
            intersect: false,
        },
        layout: {
            padding: 10,
        },
        legend: {
            position: 'bottom',
        }
    };

    var myChart = new Chart(canvas, {
        type: 'line',
        data: data2,
        options: options
    });

    window.adddata = function() {
        var xrate_2vnd = document.getElementById('xrate_2vnd').value;
        cutomdtaset2 = [];
        total_ls2 = [];
        paid_ls2 = [];
        notice_ls2 = [];
        remained_ls2 = [];

        for (let y = 0; y < date_ls0.length; y++) {
            var content_tmp = tmp.filter(function (x) {
                return x.key == date_ls0[y]
            });
            if (content_tmp.length > 0) {
                total_point2 = content_tmp[0].cur.buckets.map(function (x) { if (x.key == 'U_057') { return x.total.value * xrate_2vnd } else { return x.total.value } }).reduce((a, b) => a + b, 0);
                total_ls2.push(total_point2);
                paid_point2 = content_tmp[0].cur.buckets.map(function (x) { if (x.key == 'U_057') { return x.paid.value * xrate_2vnd } else { return x.paid.value } }).reduce((a, b) => a + b, 0);
                paid_ls2.push(paid_point2);
                notice_point2 = content_tmp[0].cur.buckets.map(function (x) { if (x.key == 'U_057') { return x.notice.value * xrate_2vnd } else { return x.notice.value } }).reduce((a, b) => a + b, 0);
                notice_ls2.push(notice_point2);
                remained_point2 = total_point2 - paid_point2;
                remained_ls2.push(remained_point2);
            } else {
                total_ls2.push(0);
                paid_ls2.push(0);
                notice_ls2.push(0);
                remained_ls2.push(0);
            }
        }

        let a2 = 0, b2 = 0, c2 = 0, d2 = 0;
        total_ls02 = total_ls2.map(x => ({ ...x, "cumsum": a2 += x }));
        total_ls2 = total_ls02.map(x => x.cumsum.toFixed(4));
        paid_ls02 = paid_ls2.map(x => ({ ...x, "cumsum": b2 += x }));
        paid_ls2 = paid_ls02.map(x => x.cumsum.toFixed(4));
        notice_ls02 = notice_ls2.map(x => ({ ...x, "cumsum": c2 += x }));
        notice_ls2 = notice_ls02.map(x => x.cumsum.toFixed(4));
        remained_ls02 = remained_ls2.map(x => ({ ...x, "cumsum": d2 += x }));
        remained_ls2 = remained_ls02.map(x => x.cumsum.toFixed(4));

        cutomdtaset2 = [];
        cutomdtaset2.push(`{"label": "Phải thu","backgroundColor": "${corlor_ls[0]}","borderColor": "${corlor_ls[1]}","data": [${String(total_ls2)}],"tension": 0.4}`);
        cutomdtaset2.push(`{"label": "Đã thu","backgroundColor": "${corlor_ls2[0]}","borderColor": "${corlor_ls2[1]}","data": [${String(paid_ls2)}],"tension": 0.4}`);
        cutomdtaset2.push(`{"label": "Báo thu","backgroundColor": "${corlor_ls3[0]}","borderColor": "${corlor_ls3[1]}","data": [${String(notice_ls2)}],"tension": 0.4}`);
        cutomdtaset2.push(`{"label": "Còn lại","backgroundColor": "${corlor_ls4[0]}","borderColor": "${corlor_ls4[1]}","data": [${String(remained_ls2)}],"tension": 0.4}`);

        cutomdtaset2 = `[${cutomdtaset2}]`;

        var data3 = {
            labels: date_ls0,
            datasets: JSON.parse(cutomdtaset2)
        };

        myChart.data = data3;
        myChart.update();
    }

    return myChart;
}

// Usage example:
window.onload = function() {
    if (document.getElementById('stupdate')) {
        document.getElementById('stupdate').click();
    }
}
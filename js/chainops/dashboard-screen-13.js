const API_URL = "https://pphoiqknkmwzstuokdmz.supabase.co/functions/v1/dashboard-stats";
        const state = {
            raw: null,
            month: "",
            year: "",
            chart: null,
            targetUserId: "",
            viewableUsers: []
        };

        // Tab styling classes
        const TAB_ACTIVE = "bg-white text-theme-primary border-theme-primary";
        const TAB_INACTIVE = "bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200";

        function showDebug(payload) {
            const log = document.getElementById("debug-log");
            const content = document.getElementById("debug-content");
            if (!payload) {
                log.classList.add("hidden");
                content.textContent = "";
                return;
            }
            content.textContent = typeof payload === "string"
                ? payload
                : JSON.stringify(payload, null, 2);
            log.classList.remove("hidden");
        }

        function setStatus(msg, isError = false, icon = null) {
            const el = document.getElementById("status");
            const iconEl = document.getElementById("status-icon");
            const textEl = document.getElementById("status-text");

            textEl.textContent = msg;
            el.className = `status-enter rounded-lg p-3 mb-4 flex items-center gap-3 text-sm ${isError
                ? 'bg-red-50 border border-red-200'
                : 'bg-emerald-50 border border-emerald-200'
                }`;

            if (icon) {
                iconEl.className = `fas ${icon} ${isError ? 'text-red-600' : 'text-emerald-600'} text-lg`;
            } else {
                iconEl.className = `fas fa-spinner fa-spin ${isError ? 'text-red-600' : 'text-theme-primary'} text-lg`;
            }
        }

        function formatCurrency(v) {
            if (v === null || v === undefined || isNaN(v)) return "--";
            return Number(v).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
        }

        function formatPercent(v) {
            if (v === null || v === undefined || isNaN(v)) return "--";
            return `${(Number(v) * 100).toFixed(2)}%`;
        }

        function formatDate(d) {
            if (!d) return "";
            try {
                const date = new Date(d);
                return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch (e) { return d; }
        }

        function parseMonthKey(monthStr) {
            if (!monthStr || typeof monthStr !== "string") return { year: "", month: "" };
            const parts = monthStr.split("-");
            return { year: parts[0] || "", month: parts[1] || "" };
        }

        function unique(arr) {
            return Array.from(new Set(arr.filter(Boolean)));
        }

        function isAppBridgeAvailable() {
            return typeof App !== "undefined" && typeof App.callApi === "function";
        }

        function safeParse(input) {
            if (input === null || input === undefined) return null;
            if (typeof input === "object") return input;
            if (typeof input === "string") {
                try { return JSON.parse(input); } catch (e) { return null; }
            }
            return null;
        }

        function generateCallbackName(prefix) {
            return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        }

        function fetchDashboard() {
            if (!isAppBridgeAvailable()) {
                setStatus("Cầu nối ứng dụng không khả dụng (App.callApi).", true, "fa-exclamation-triangle");
                showDebug("App.callApi không khả dụng trong ngữ cảnh này.");
                return;
            }
            setStatus("Đang yêu cầu dữ liệu...", false);
            showDebug(null);
            const payload = {
                target_user_id: state.targetUserId || null
            };
            const headers = {
                "Content-Type": "application/json"
            };
            const cb = generateCallbackName("handleSupabase");
            window[cb] = function (payload) {
                delete window[cb];
                if (payload.status === "error") {
                    setStatus(`API error: ${payload.error}`, true, "fa-times-circle");
                    showDebug(payload);
                    return;
                }
                if (payload.statusCode >= 400) {
                    setStatus(`API trả về ${payload.statusCode}`, true, "fa-times-circle");
                    showDebug(payload.data || payload);
                    return;
                }
                const data = safeParse(payload.data);
                if (!data) {
                    setStatus("Không thể phân tích phản hồi.", true, "fa-times-circle");
                    showDebug(payload.data || payload);
                    return;
                }
                state.raw = data;
                state.viewableUsers = Array.isArray(data.viewable_users) && data.viewable_users.length
                    ? data.viewable_users
                    : [{ id: data.user?.id || "", label: data.user?.full_name || data.user?.username || data.user?.email || "Me" }];
                state.targetUserId = data.target_user?.id || state.targetUserId || data.user?.id || "";
                populateFilters(data);
                renderAll();
                setStatus("Đã tải bảng điều khiển thành công!", false, "fa-check-circle");
                showDebug(null);
                setTimeout(() => {
                    document.getElementById("status").style.display = "none";
                }, 3000);
            };
            App.callApi(API_URL, "POST", JSON.stringify(payload), JSON.stringify(headers), true, cb);
        }

        function populateFilters(data) {
            const months = (data.monthly_stats || []).map(m => parseMonthKey(m.month).month);
            const years = (data.monthly_stats || []).map(m => parseMonthKey(m.month).year);
            const userSelect = document.getElementById("filter-user");
            userSelect.innerHTML = "";
            (state.viewableUsers || []).forEach(u => {
                const opt = document.createElement("option");
                opt.value = u.id;
                opt.textContent = u.label || u.id;
                userSelect.appendChild(opt);
            });
            if (state.targetUserId) {
                userSelect.value = state.targetUserId;
            }

            const monthSelect = document.getElementById("filter-month");
            const yearSelect = document.getElementById("filter-year");
            monthSelect.innerHTML = '<option value="">Tất cả các tháng</option>';
            unique(months).sort().forEach(m => {
                const opt = document.createElement("option");
                opt.value = m;
                opt.textContent = `Tháng ${m}`;
                monthSelect.appendChild(opt);
            });
            yearSelect.innerHTML = '<option value="">Tất cả các năm</option>';
            unique(years).sort((a, b) => b.localeCompare(a)).forEach(y => {
                const opt = document.createElement("option");
                opt.value = y;
                opt.textContent = y;
                yearSelect.appendChild(opt);
            });
        }

        function applyFilters() {
            if (!state.raw) return { summary: null, transactions: [], monthly_stats: [] };
            const month = state.month;
            const year = state.year;
            const monthly = (state.raw.monthly_stats || []).filter(m => {
                const { month: mm, year: yy } = parseMonthKey(m.month);
                const monthMatch = !month || mm === month;
                const yearMatch = !year || yy === year;
                return monthMatch && yearMatch;
            });
            const transactions = (state.raw.transactions || []).filter(tx => {
                if (!month && !year) return true;
                const txDate = new Date(tx.created_at);
                const txMonth = String(txDate.getMonth() + 1).padStart(2, "0");
                const txYear = String(txDate.getFullYear());
                const monthMatch = !month || txMonth === month;
                const yearMatch = !year || txYear === year;
                return monthMatch && yearMatch;
            });
            let summary = state.raw.summary || {};
            if (month || year) {
                const total_commissions = monthly.reduce((sum, m) => sum + (m.total_commission || 0), 0);
                const total_sales = monthly.reduce((sum, m) => sum + (m.personal_sales_volume || 0), 0);
                summary = {
                    ...summary,
                    total_sales,
                    total_commissions,
                    transaction_count: transactions.length,
                    current_month: monthly[0] || null
                };
            }
            return { summary, transactions, monthly_stats: monthly };
        }

        function computeOverview(stats, summary) {
            const totals = (stats || []).reduce((acc, m) => {
                acc.personal_sales_volume += Number(m.personal_sales_volume || 0);
                acc.shared_out_volume += Number(m.shared_out_volume || 0);
                acc.received_volume += Number(m.received_volume || 0);
                acc.f1_sales_volume += Number(m.f1_sales_volume || 0);
                acc.comm_direct += Number(m.comm_direct || 0);
                acc.comm_shared += Number(m.comm_shared || 0);
                acc.comm_received += Number(m.comm_received || 0);
                acc.comm_override += Number(m.comm_override || 0);
                acc.total_commission += Number(m.total_commission || 0);
                acc.tier_rate = m.tier_rate !== undefined ? m.tier_rate : acc.tier_rate;
                return acc;
            }, {
                personal_sales_volume: 0,
                shared_out_volume: 0,
                received_volume: 0,
                f1_sales_volume: 0,
                comm_direct: 0,
                comm_shared: 0,
                comm_received: 0,
                comm_override: 0,
                total_commission: 0,
                tier_rate: 0
            });

            const kpiCards = [
                { title: "Tổng Doanh Thu", value: formatCurrency(totals.personal_sales_volume + totals.shared_out_volume + totals.received_volume + totals.f1_sales_volume), icon: "fa-dollar-sign", color: "blue" },
                { title: "Tổng Hoa Hồng", value: formatCurrency(totals.total_commission || summary?.total_commissions || 0), icon: "fa-coins", color: "green" },
                { title: "Hoa Hồng Bán Lẻ", value: formatCurrency(totals.comm_direct), icon: "fa-hand-holding-usd", color: "purple" },
                { title: "Hoa Hồng Chênh Lệch", value: formatCurrency(totals.comm_override), icon: "fa-layer-group", color: "orange" },
                { title: "Chia Sẻ Ra", value: formatCurrency(totals.shared_out_volume), icon: "fa-share-alt", color: "cyan" },
                { title: "Chia Sẻ Nhận", value: formatCurrency(totals.received_volume), icon: "fa-download", color: "indigo" },
                { title: "Doanh Số F1", value: formatCurrency(totals.f1_sales_volume), icon: "fa-users", color: "pink" },
                { title: "Tỷ Lệ Bậc", value: formatPercent(totals.tier_rate), icon: "fa-percentage", color: "emerald" }
            ];
            return { totals, kpiCards };
        }

        function renderAll() {
            const { summary, transactions, monthly_stats } = applyFilters();
            const { kpiCards } = computeOverview(monthly_stats, summary);
            renderKpis(kpiCards);
            renderTransactions(transactions);
            renderTrends(monthly_stats);
            renderRelations();
        }

        function renderKpis(cards) {
            const container = document.getElementById("kpi-cards");
            container.innerHTML = "";
            cards.forEach(c => {
                const colorMap = {
                    blue: 'bg-blue-50 text-blue-700 border-blue-200',
                    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    purple: 'bg-purple-50 text-purple-700 border-purple-200',
                    orange: 'bg-orange-50 text-orange-700 border-orange-200',
                    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    pink: 'bg-pink-50 text-pink-700 border-pink-200',
                    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                };
                const div = document.createElement("div");
                div.className = `bg-white rounded-lg p-3 shadow-sm border ${colorMap[c.color] || 'border-gray-200'}`;
                div.innerHTML = `
          <div class="flex items-center gap-2 mb-2">
            <i class="fas ${c.icon} text-sm opacity-70"></i>
            <h3 class="text-xs font-semibold opacity-80">${c.title}</h3>
          </div>
          <div class="text-base sm:text-lg font-bold">${c.value}</div>
        `;
                container.appendChild(div);
            });
        }

        function renderTransactions(txns) {
            const list = document.getElementById("txn-list");
            list.innerHTML = "";
            const sorted = (txns || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20);
            if (!sorted.length) {
                list.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-inbox text-3xl mb-2 text-gray-300"></i><p class="text-sm">Không có giao dịch gần đây.</p></div>';
                return;
            }
            const userLabel = (uid) => {
                const hit = (state.viewableUsers || []).find(u => u.id === uid);
                return hit?.label || uid || "Unknown";
            };
            const typeLabels = {
                retail_sales: 'Bán Lẻ',
                commission: 'Hoa Hồng',
                kpi_reward: 'Thưởng KPI',
                shared_received: 'Chia Sẻ Nhận',
                shared_out: 'Chia Sẻ Ra'
            };
            const statusLabels = {
                approved: 'Đã Duyệt',
                pending: 'Chờ Duyệt',
                paid: 'Đã Thanh Toán',
                blocked: 'Bị Khóa'
            };
            sorted.forEach(txn => {
                const typeIcons = {
                    retail_sales: 'fa-shopping-cart',
                    commission: 'fa-coins',
                    kpi_reward: 'fa-trophy'
                };
                const statusColors = {
                    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    paid: 'bg-blue-100 text-blue-800 border-blue-200'
                };

                const meta = txn.metadata || {};
                const customer = meta.customer || {};
                const customerName = customer.name || customer.email || "Khách lẻ";
                const productInfo = meta.products && meta.products.length ? meta.products.join(", ") : (meta.order_name || "Chi tiết đơn");

                const div = document.createElement("div");
                div.className = "bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:border-theme-primary transition-all duration-200 shadow-sm mb-3";
                
                div.innerHTML = `
                    <div class="p-3 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                                <i class="fas ${typeIcons[txn.type] || 'fa-file-invoice'} text-theme-primary text-sm"></i>
                            </div>
                            <div class="min-w-0">
                                <div class="font-bold text-gray-900 text-sm leading-tight">${formatCurrency(txn.amount)}</div>
                                <div class="text-[11px] text-blue-600 font-semibold truncate mt-0.5">${customerName}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${statusColors[txn.status] || 'bg-gray-100 text-gray-600'}">
                                ${statusLabels[txn.status] || txn.status}
                            </span>
                            <i class="fas fa-chevron-down text-[10px] text-gray-400 transition-transform duration-300" id="chevron-${txn.id}"></i>
                        </div>
                    </div>

                    <div class="hidden px-3 pb-3 pt-2 border-t border-dashed border-gray-100 bg-gray-50/50" id="details-${txn.id}">
                        <div class="grid grid-cols-1 gap-2.5">
                            <div class="flex items-start gap-2">
                                <i class="fas fa-box-open text-[10px] text-gray-400 mt-1"></i>
                                <div class="text-[11px] text-gray-600 leading-relaxed">
                                    <span class="text-gray-400 font-medium">Sản phẩm:</span> 
                                    <span class="font-medium text-gray-700 italic">${productInfo}</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between pt-1">
                                <div class="flex items-center gap-1.5 text-[10px] text-gray-400">
                                    <i class="fas fa-clock"></i>
                                    <span>${formatDate(txn.created_at)}</span>
                                </div>
                                <div class="text-[10px] text-gray-300 font-mono">ID: ${txn.id.slice(-8)}</div>
                            </div>
                        </div>
                    </div>
                `;

                div.onclick = () => {
                    const details = div.querySelector(`#details-${txn.id}`);
                    const chevron = div.querySelector(`#chevron-${txn.id}`);
                    const isHidden = details.classList.contains('hidden');
                    
                    if (isHidden) {
                        details.classList.remove('hidden');
                        chevron.classList.add('rotate-180');
                        div.classList.add('ring-1', 'ring-theme-primary/20', 'border-theme-primary/30');
                    } else {
                        details.classList.add('hidden');
                        chevron.classList.remove('rotate-180');
                        div.classList.remove('ring-1', 'ring-theme-primary/20', 'border-theme-primary/30');
                    }
                };

                list.appendChild(div);
            });
        }

        function renderTrends(stats) {
            const canvas = document.getElementById("trendsChart");
            const ctx = canvas.getContext("2d");

            if (state.chart) {
                state.chart.destroy();
            }

            if (!stats || stats.length === 0) {
                const parent = canvas.parentElement;
                const rect = parent.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "14px sans-serif";
                ctx.fillStyle = "#9ca3af";
                ctx.textAlign = "center";
                ctx.fillText("Không có dữ liệu xu hướng", canvas.width / 2, canvas.height / 2);
                return;
            }

            const sorted = stats.slice().sort((a, b) => a.month.localeCompare(b.month));
            const labels = sorted.map(s => s.month);
            const salesData = sorted.map(s => s.personal_sales_volume || 0);
            const commData = sorted.map(s => s.total_commission || 0);

            state.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Doanh Số Cá Nhân',
                            data: salesData,
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Tổng Hoa Hồng',
                            data: commData,
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.3,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 8,
                                font: { family: 'sans-serif', size: 10 }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                },
                                font: { family: 'sans-serif', size: 9 }
                            }
                        },
                        x: {
                            ticks: {
                                font: { family: 'sans-serif', size: 9 },
                                maxRotation: 45,
                                minRotation: 0
                            }
                        }
                    }
                }
            });
        }

        function renderRelations() {
            const container = document.getElementById("relation-tree");
            const users = state.viewableUsers || [];
            const targetUser = state.raw?.target_user || null;
            const selfUser = state.raw?.user || null;
            const relationNodes = Array.isArray(state.raw?.relation_nodes) ? state.raw.relation_nodes : [];

            const getUserLabel = (u) => {
                if (!u) return "";
                return u.label || u.full_name || u.fullName || u.name || u.username || u.email || u.id || "";
            };

            const personCard = (label, icon, tone, badge = "") => `
                <div class="flex items-center gap-2 p-3 rounded-lg border ${tone}">
                    <i class="fas ${icon} text-xs"></i>
                    <span class="text-sm font-medium truncate flex-1">${label || "Không rõ"}</span>
                    ${badge}
                </div>
            `;

            const meId = targetUser?.id || selfUser?.id || "";
            const meLabel = getUserLabel(targetUser) || getUserLabel(selfUser) || (meId ? `ID: ${meId}` : "");

            if (relationNodes.length && meId) {
                const byId = new Map(relationNodes.map(n => [n.id, n]));
                const meNode = byId.get(meId) || null;
                const parentNode = meNode?.parent_id ? byId.get(meNode.parent_id) || { id: meNode.parent_id, label: `ID: ${meNode.parent_id}` } : null;
                const childNodes = relationNodes.filter(n => n.parent_id === meId);

                container.innerHTML = `
                    <div class="text-left space-y-4">
                        ${parentNode ? `
                        <div>
                            <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">Tuyến trên</div>
                            ${personCard(getUserLabel(parentNode), 'fa-user-tie', 'bg-amber-50 text-amber-700 border-amber-200', '<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Parent</span>')}
                        </div>` : '<div class="text-xs text-gray-400 italic">Người này đang ở cấp gốc.</div>'}

                        ${meLabel ? `
                        <div>
                            <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">Người đang xem</div>
                            ${personCard(meLabel, 'fa-user-shield', 'bg-emerald-50 text-emerald-700 border-emerald-200', '<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Bạn</span>')}
                        </div>` : ''}

                        ${childNodes.length ? `
                        <div>
                            <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">Tuyến dưới trực tiếp</div>
                            <div class="space-y-2">
                                ${childNodes.map(u => personCard(getUserLabel(u), 'fa-user', 'bg-gray-50 text-gray-700 border-gray-200')).join('')}
                            </div>
                        </div>` : ''}
                    </div>
                `;
                return;
            }

            const teammates = users.filter(u => u && u.id !== meId);

            if (!meLabel && !teammates.length) {
                container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-info-circle text-3xl mb-3 text-gray-300"></i><p class="text-sm">Không có dữ liệu quan hệ.</p></div>';
                return;
            }

            container.innerHTML = `
                <div class="text-left space-y-4">
                    <div class="text-xs text-gray-400 italic">Không có relation_nodes, đang dùng dữ liệu fallback.</div>
                    ${meLabel ? `
                    <div>
                        <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">Người đang xem</div>
                        ${personCard(meLabel, 'fa-user-shield', 'bg-emerald-50 text-emerald-700 border-emerald-200', '<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Bạn</span>')}
                    </div>` : ''}
                    ${teammates.length ? `
                    <div>
                        <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">Người liên quan / cùng quyền xem</div>
                        <div class="space-y-2">
                            ${teammates.map(u => personCard(getUserLabel(u), 'fa-user', 'bg-gray-50 text-gray-700 border-gray-200')).join('')}
                        </div>
                    </div>` : ''}
                </div>
            `;
        }

        function setupTabs() {
            const tabs = document.querySelectorAll(".tab-btn");
            const contents = document.querySelectorAll(".tab-content");

            tabs.forEach(tab => {
                tab.addEventListener("click", () => {
                    const target = tab.getAttribute("data-tab");

                    tabs.forEach(t => {
                        t.classList.remove("active", ...TAB_ACTIVE.split(" "));
                        t.classList.add(...TAB_INACTIVE.split(" "));
                    });
                    tab.classList.add("active", ...TAB_ACTIVE.split(" "));
                    tab.classList.remove(...TAB_INACTIVE.split(" "));

                    contents.forEach(content => {
                        content.classList.add("hidden");
                    });
                    document.getElementById(target).classList.remove("hidden");
                });
            });

            // Set initial state
            tabs[0].classList.add(...TAB_ACTIVE.split(" "));
            tabs[0].classList.remove(...TAB_INACTIVE.split(" "));
            tabs.forEach((t, i) => {
                if (i > 0) {
                    t.classList.add(...TAB_INACTIVE.split(" "));
                    t.classList.remove(...TAB_ACTIVE.split(" "));
                }
            });
        }

        function setupFilters() {
            document.getElementById("filter-user").addEventListener("change", (e) => {
                state.targetUserId = e.target.value;
                document.getElementById("status").style.display = "flex";
                fetchDashboard();
            });
            document.getElementById("filter-month").addEventListener("change", (e) => {
                state.month = e.target.value;
                renderAll();
            });
            document.getElementById("filter-year").addEventListener("change", (e) => {
                state.year = e.target.value;
                renderAll();
            });
        }

        document.addEventListener("DOMContentLoaded", () => {
            setupTabs();
            setupFilters();
            fetchDashboard();
        });

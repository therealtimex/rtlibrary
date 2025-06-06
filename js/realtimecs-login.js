
function applyLanguage() {
        // Set HTML lang attribute
        document.documentElement.lang = currentLang;

        // Update banner texts
        document.getElementById('trial-mode-title').textContent = T.trial_mode_title;
        document.getElementById('trial-mode-desc').textContent = T.trial_mode_desc;
        document.getElementById('btn-setup-trial').textContent = T.setup_btn;
        document.getElementById('official-status').textContent = T.official_status;
        document.getElementById('btn-org-settings').textContent = T.settings_btn;

        // Update welcome texts
        document.getElementById('welcome-message').textContent = T.welcome_app;

        // Update setup dialog
        document.getElementById('setup-org-title').textContent = T.setup_org_title;
        document.getElementById('setup-org-desc').textContent = T.setup_org_desc;
        document.getElementById('create-org-title').textContent = T.create_org_title;
        document.getElementById('create-org-desc').textContent = T.create_org_desc;
        document.getElementById('join-org-title').textContent = T.join_org_title;
        document.getElementById('join-org-desc').textContent = T.join_org_desc;
        document.getElementById('btn-continue-trial').textContent = T.continue_trial;

        // Update form labels
        document.getElementById('org-name-label').textContent = T.org_name_label;
        document.getElementById('org-name-input').placeholder = T.org_name_placeholder;
        document.getElementById('org-shortname-label').textContent = T.org_shortname_label;
        document.getElementById('org-shortname').placeholder = T.org_shortname_placeholder;
        document.getElementById('business-type-label').textContent = T.business_type_label;
        document.getElementById('business-auto').textContent = T.business_auto;
        document.getElementById('business-electronics').textContent = T.business_electronics;
        document.getElementById('business-ac').textContent = T.business_ac;
        document.getElementById('business-appliance').textContent = T.business_appliance;
        document.getElementById('business-other').textContent = T.business_other;
        document.getElementById('contact-name-label').textContent = T.contact_name_label;
        document.getElementById('contact-email-label').textContent = T.contact_email_label;
        document.getElementById('contact-phone-label').textContent = T.contact_phone_label;
        document.getElementById('org-code-label').textContent = T.org_code_label;
        document.getElementById('org-code-input').placeholder = T.org_code_placeholder;
        document.getElementById('org-code-help').textContent = T.org_code_help;

        // Update buttons
        document.getElementById('btn-back-create').textContent = T.back_btn;
        document.getElementById('btn-submit-org').textContent = T.create_org_btn;
        document.getElementById('btn-back-join').textContent = T.back_btn;
        document.getElementById('btn-confirm-join').textContent = T.join_btn;
        document.getElementById('btn-close-result').textContent = T.close_btn;
    }


function setupEventHandlers() {
        // Setup trial button (from trial banner)
        document.getElementById('btn-setup-trial').onclick = function() {
            showSetupDialog();
        };

        // Organization settings button (from official banner)
        document.getElementById('btn-org-settings').onclick = function() {
            alert(T.settings_alert);
        };

        // Close setup dialog
        document.getElementById('btn-close-setup').onclick = function() {
            hideSetupDialog();
        };

        // Create org button
        document.getElementById('btn-create-org').onclick = function() {
            document.getElementById('setup-selection').classList.add('hidden');
            document.getElementById('create-org-form').classList.remove('hidden');

            // Pre-fill form
            document.getElementById('contact-name').value = config.userFullName;
            document.getElementById('contact-email').value = config.userEmail;
            document.getElementById('contact-phone').value = config.userPhone;
        };

        // Join org button
        document.getElementById('btn-join-org').onclick = function() {
            document.getElementById('setup-selection').classList.add('hidden');
            document.getElementById('join-org-form').classList.remove('hidden');
        };

        // Continue trial button
        document.getElementById('btn-continue-trial').onclick = function() {
            hideSetupDialog();
        };

        // Back buttons
        document.getElementById('btn-back-create').onclick = function() {
            document.getElementById('create-org-form').classList.add('hidden');
            document.getElementById('setup-selection').classList.remove('hidden');
        };

        document.getElementById('btn-back-join').onclick = function() {
            document.getElementById('join-org-form').classList.add('hidden');
            document.getElementById('setup-selection').classList.remove('hidden');
        };

        // Create org form submit
        document.getElementById('org-create-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const orgName = document.getElementById('org-name-input').value.trim();
            let shortName = document.getElementById('org-shortname').value.trim();
            if (!shortName) shortName = orgName;
            const contactName = document.getElementById('contact-name').value.trim();
            const contactEmail = document.getElementById('contact-email').value.trim();
            const contactPhone = document.getElementById('contact-phone').value.trim();

            let orgId;
            if (userType === 'trial') {
                orgId = 's' + generateRandomId();
            } else if (userType === 'unidentified') {
                orgId = config.userOrgId;
            }

            const payload = {
                event_id: `rt${config.appShortName.toLowerCase()}.neworg`,
                new_org: '1',
                project_code: config.projectCode,
                data: [{
                    username: config.username,
                    fullname: config.userFullName,
                    user_role: config.userRoledefault,
                    email: config.userEmail,
                    cellphone: config.userPhone && config.userPhone.trim() ? config.userPhone : '0',
                    user_status: '1',
                    org_id: orgId,
                    org_name: shortName,
                    contact_name: contactName,
                    contact_email: contactEmail,
                    contact_phone: contactPhone || '0',
                    context_title: `${shortName}-${config.appShortName}`
                }]
            };

            fetch(config.apiEndpoints.webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json(); 
            })
            .then(() => {
                showResult(T.notify(orgName, contactEmail));
                this.reset();
            })
            .catch(err => {
                console.error('Submit error:', err);
                showResult(T.error, '#e74c3c');
            });
        });

        // Join org confirm button
        document.getElementById('btn-confirm-join').onclick = async function() {
            const code = document.getElementById('org-code-input').value.trim();
            const errorElem = document.getElementById('org-error');
            errorElem.style.display = 'none';

            if (!foundOrg) {
                if (!code) {
                    errorElem.textContent = T.error_empty;
                    errorElem.style.display = 'block';
                    return;
                }
                this.disabled = true;
                this.textContent = T.confirm_btn + '...';
                try {
                    const response = await fetch(config.apiEndpoints.orgSearch, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            "size": 1,
                            "query": { "bool": { "must": [{ "term": { "org_id.raw": { "value": code } } }] } }
                        })
                    });
                    const data = await response.json();
                    this.disabled = false;
                    this.textContent = T.confirm_btn;
                    if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
                        foundOrg = data.hits.hits[0]._source;
                        errorElem.innerHTML = `<b class="org-name-found">${foundOrg.org_lb || foundOrg.org_name || code}</b>`;
                        errorElem.style.display = 'block';
                        errorElem.style.color = '#16a75c';
                        this.textContent = T.request_join;
                    } else {
                        errorElem.textContent = T.error_notfound;
                        errorElem.style.display = 'block';
                    }
                } catch (err) {
                    this.disabled = false;
                    this.textContent = T.confirm_btn;
                    errorElem.textContent = T.error;
                    errorElem.style.display = 'block';
                }
            } else {
                this.disabled = true;
                this.textContent = T.sending;
                try {
                    await fetch(config.apiEndpoints.webhook, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event_id: `rt${config.appShortName.toLowerCase()}.user`,
                            user_trial: '0',
                            project_code: config.projectCode,
                            data: [{
                                username: config.username,
                                fullname: config.userFullName,
                                user_role: config.userRoledefault,
                                cellphone: config.userPhone && config.userPhone.trim() ? config.userPhone : '0',
                                user_status: '1',
                                email: config.userEmail,
                                org_id: foundOrg.org_id,
                                org_name: foundOrg.org_lb
                            }]
                        })
                    });
                    showResult(T.join_success.replace('{org}', foundOrg.org_lb || foundOrg.org_name || code));
                } catch (err) {
                    errorElem.textContent = T.error;
                    errorElem.style.display = 'block';
                }
                this.disabled = false;
                this.textContent = T.request_join;
            }
        };

        // Close result button
        document.getElementById('btn-close-result').onclick = function() {
            document.getElementById('result-screen').classList.add('hidden');
        };
    }

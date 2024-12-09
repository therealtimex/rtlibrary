
function callPhone(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        phone: element.getAttribute('data-phone'),
        type: 'act_call'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function sendSMS(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        phone: element.getAttribute('data-phone'),
        defaultMsg: element.getAttribute('data-default-msg'),
        type: 'act_sms'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function openLocation(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        name: element.getAttribute('data-name'),
        lat: parseFloat(element.getAttribute('data-lat')),
        lon: parseFloat(element.getAttribute('data-lon')),
        mapType: element.getAttribute('data-map-type'),
        type: 'act_gps'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function shareContent(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        copy: element.getAttribute('data-copy') === 'true',
        body: element.getAttribute('data-body'),
        subject: element.getAttribute('data-subject'),
        type: 'act_share'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function callCloudPhone(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        name: element.getAttribute('data-name'),
        phone: element.getAttribute('data-phone'),
        isVideoCall: element.getAttribute('data-video-call') === 'true',
        isCallOut: element.getAttribute('data-call-out') === 'true',
        customData: JSON.parse(element.getAttribute('data-custom-data')),
        type: 'act_call_cloudphone'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function openForm(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        familyID: element.getAttribute('data-family-id'),
        dismissParent: element.getAttribute('data-dismiss-parent') === 'true',
        dependencies: JSON.parse(element.getAttribute('data-dependencies')),
        preload: JSON.parse(element.getAttribute('data-preload')),
        openArgs: JSON.parse(element.getAttribute('data-open-args')),
        preload_repeat: JSON.parse(element.getAttribute('data-preload-repeat')),
        type: 'act_fill_form'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function openReport(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        reportID: element.getAttribute('data-report-id'),
        type: 'act_report'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function openDMView(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        subModule: element.getAttribute('data-sub-module'),
        component: element.getAttribute('data-component'),
        object: element.getAttribute('data-object'),
        alias: element.getAttribute('data-alias'),
        screen: element.getAttribute('data-screen'),
        where: element.getAttribute('data-where'),
        get: JSON.parse(element.getAttribute('data-get') || '{}'),
        post: JSON.parse(element.getAttribute('data-post') || '{}'),
        args: JSON.parse(element.getAttribute('data-args') || '{}'),
        dismissParent: element.getAttribute('data-dismiss-parent') === 'true',
        type: 'act_dm_view'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function getInstance(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        familyName: element.getAttribute('data-family-name'),
        display: element.getAttribute('data-display'),
        uuid: element.getAttribute('data-uuid'),
        isLast: element.getAttribute('data-is-last') === 'true',
        clone: element.getAttribute('data-clone') === 'true',
        removeQuestions: JSON.parse(element.getAttribute('data-remove-questions') || '[]'),
        filter: JSON.parse(element.getAttribute('data-filter') || '[]'),
        openArgs: JSON.parse(element.getAttribute('data-open-args') || '{}'),
        type: 'act_get_instance'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function openModule(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        destinationCode: element.getAttribute('data-destination-code'),
        destinationType: element.getAttribute('data-destination-type'),
        args: JSON.parse(element.getAttribute('data-args') || '{}'),
        dismissParent: element.getAttribute('data-dismiss-parent') === 'true',
        type: 'act_open_module'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function openChat(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        room_target: element.getAttribute('data-room-target'),
        room_title: element.getAttribute('data-room-title'),
        type: 'act_open_chat'
    };
    App.callActionButton(JSON.stringify(actionData));
}


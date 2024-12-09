function callActionSMS(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        defaultMsg: element.getAttribute('data-msg'),
        orderNumber: parseInt(element.getAttribute('data-order')),
        phone: act_sms,
        type: element.getAttribute('data-type')
    };
    App.callActionButton(JSON.stringify(actionData));
}

function callActionCP(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        orderNumber: parseInt(element.getAttribute('data-order')),
        isVideoCall: element.getAttribute('data-video') === 'true',
        isCallOut: element.getAttribute('data-callout') === 'true',
        type: act_call_cloudphone,
        phone: element.getAttribute('data-phone')
    };
    App.callActionButton(JSON.stringify(actionData));
}

function callActionCALL(element) {
    const actionData = {
        actionID: parseInt(element.getAttribute('data-action-id')),
        orderNumber: parseInt(element.getAttribute('data-order')),
        type: act_call,
        phone: element.getAttribute('data-phone')
    };
    App.callActionButton(JSON.stringify(actionData));
}
const surveyData = {
    locale: "en",
    pages: [{
        name: "contact",
        elements: [{
            type: "text",
            name: "name",
            title: {
                en: "Name",
                fr: "Nom",
                vi: "Họ Tên"
            },
            isRequired: true,
            placeholder: {
                en: "Enter your name",
                fr: "Entrez votre nom",
                vi: "Nhập họ tên của bạn"
            },
            validators: [{
                type: "text",
                minLength: 2,
                pattern: "^[A-Za-z ]*$",
                text: {
                    en: "Please enter a valid name (minimum 2 characters, letters only)",
                    fr: "Veuillez entrer un nom valide (minimum 2 caractères, lettres uniquement)",
                    vi: "Vui lòng nhập tên hợp lệ (tối thiểu 2 ký tự, chỉ chữ cái)"
                }
            }]
        }, {
            type: "text",
            name: "email",
            inputType: "email",
            title: {
                en: "Email",
                fr: "Email",
                vi: "Email"
            },
            isRequired: true,
            placeholder: {
                en: "Enter your email",
                fr: "Entrez votre email",
                vi: "Nhập email của bạn"
            },
            validators: [{
                type: "email",
                text: {
                    en: "Please enter a valid email address",
                    fr: "Veuillez entrer une adresse email valide",
                    vi: "Vui lòng nhập địa chỉ email hợp lệ"
                }
            }]
        }]
    }],
    completeText: {
        en: "Submit",
        fr: "Envoyer",
        vi: "Gửi"
    },
    showQuestionNumbers: "off",
    questionErrorLocation: "bottom"
};

const successMessages = {
    en: "Form submitted successfully!",
    fr: "Formulaire envoyé avec succès!",
    vi: "Gửi biểu mẫu thành công!"
};

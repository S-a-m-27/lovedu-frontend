// App Router compatible i18n configuration
export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'ar'],
  fallbackLng: 'en',
  reloadOnPrerender: true,
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
  },
  interpolation: {
    escapeValue: false,
  },
}

// Translation data
export const translations = {
  en: {
    welcome: "Welcome to LovEdu",
    description: "This is the English version of the site.",
    auth: {
      loginTitle: "Sign In",
      signupTitle: "Create Account",
      welcome: "Welcome to LovEdu",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      domainRestriction: "Access restricted to Kuwait University members only.",
      invalidCredentials: "Invalid email or password",
      accountCreated: "Account created successfully! Please check your email to verify your account."
    },
    common: {
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      loading: "Loading...",
      login: "Login",
      signup: "Sign Up",
      logout: "Logout",
      settings: "Settings",
      newChat: "New Chat",
      selectAssistant: "Select Assistant",
      adminPanel: "Admin Panel",
      typeMessage: "Type your message here...",
      kuniv: "KUNIV",
      searchChats: "Search chats",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      update: "Update",
      upload: "Upload",
      file: "File",
      files: "Files",
      show: "Show",
      hide: "Hide",
      close: "Close",
      back: "Back",
      yes: "Yes",
      no: "No",
      required: "Required",
      optional: "Optional",
      refresh: "Refresh",
      selectPDF: "Select PDF File",
      chooseFile: "Choose File",
      changeFile: "Change File",
      uploading: "Uploading...",
      uploadPDF: "Upload PDF",
      selectFileFirst: "Select a file first",
      filesUploaded: "files uploaded"
    },
    chat: {
      title: "University AI Assistant",
      placeholder: "Type your message here...",
      send: "Send",
      thinking: "AI is thinking...",
      welcome: "Hello! I'm your LovEdu AI Assistant. How can I help you today?",
      assistants: {
        typeX: "KU Advisor",
        references: "Student Rights Advisor",
        academicReferences: "References",
        therapyGPT: "Success Stories",
        whatsTrendy: "What's Trendy",
        course: "Course Chat"
      },
      modes: {
        gpt: "Chatgpt",
        perplexity: "Preplexity"
      },
      welcomeMessages: {
        typeX: "Hello! I'm LovEdu, your Kuwait University Advisor. I'm here to help you with academic regulations, registration, GPA, graduation requirements, and official procedures. How can I assist you today?",
        references: "Hello! I'm LovEdu, your Kuwait University Student Rights Advisor. I'm here to protect, explain, and clarify your academic rights at KU. I can help you with grades, GPA, appeals, complaints, and grievance pathways. How can I assist you today?",
        academicReferences: "Hello! I'm LovEdu, your References Advisor. I'm an expert in APA 7th edition referencing, specializing in Kuwait University thesis requirements. I can help you format references and in-text citations according to KU guidelines. How can I assist you today?",
        therapyGPT: "Hello! I'm LovEdu, your Success Stories Advisor. I'm here to share real success stories of previous Kuwait University students who overcame academic, psychological, or institutional challenges. How can I help inspire and guide you today?",
        whatsTrendy: "Hello! I'm LovEdu, your What's Trendy Advisor. I'm here to inform you about upcoming trends and events relevant to university life, career development, innovation, technology, culture, and student engagement. How can I help you stay informed today?",
        course: "Hello! I'm here to help you with questions about your enrolled course. How can I assist you today?"
      },
      suggestions: {
        typeX: [
          "How do I calculate my GPA at Kuwait University?",
          "What happens if I'm on academic probation?",
          "What are graduation requirements and credits?"
        ],
        references: [
          "How can I appeal a grade at KU?",
          "What are my rights if the grading feels unfair?",
          "What is the formal complaint process?"
        ],
        academicReferences: [
          "Format this reference in APA 7th (KU thesis): ...",
          "How do I format in-text citations?",
          "What does KU require for the reference list?"
        ],
        whatsTrendy: [
          "What events are trending for students this week?",
          "Any tech meetups or hackathons?",
          "What should I attend to boost my career?"
        ],
        therapyGPT: [
          "Share a success story of a student who recovered GPA.",
          "How did others handle academic stress?",
          "Share a story about overcoming probation."
        ],
        course: [
          "Summarize today's lecture topic.",
          "Explain this concept in simple terms.",
          "Give me practice questions for this topic."
        ]
      },
      composer: {
        enterToSend: "Enter to send",
        shiftEnterForNewLine: "Shift+Enter for a new line",
        hint: "Enter to send • Shift+Enter for a new line"
      },
      message: {
        copy: "Copy",
        copied: "Copied"
      },
      errors: {
        failedToSend: "Failed to send message. Please try again.",
        failedToLoadSession: "Failed to load chat session",
        failedToLoadSessions: "Failed to load chat sessions"
      }
    },
    subscribe: {
      title: "Choose Your Plan",
      description: "Select a subscription plan to access the AI Studio",
      activateWithPayPal: "Activate with PayPal",
      plans: {
        basic: {
          name: "Basic Plan",
          price: "$9.99/month"
        },
        premium: {
          name: "Premium Plan", 
          price: "$19.99/month"
        }
      }
    },
    course: {
      title: "Course Management",
      create: "Create Course",
      createNew: "Create New Course",
      createButton: "Create Course",
      creating: "Creating Course...",
      update: "Update Course",
      deleting: "Deleting Course...",
      delete: "Delete Course",
      code: "Course Code",
      name: "Course Name",
      description: "Description",
      myCourses: "My Courses",
      addCourse: "Add Course",
      enrollCourse: "Enroll in Course",
      enrolling: "Enrolling...",
      enrolled: "Enrolled",
      enroll: "Enroll",
      noCourses: "No courses found. Create your first course above.",
      loadingCourses: "Loading courses...",
      browseOrEnterCode: "Browse available courses or enter a course code",
      availableCourses: "Available Courses",
      enterCodeInstead: "Enter code instead",
      noCoursesAvailable: "No courses available at the moment",
      enterCourseCode: "Enter Course Code",
      browseCourses: "Browse courses",
      codePlaceholder: "Enter course code (e.g., CM101)",
      courseCreated: "Course created successfully!",
      courseUpdated: "Course updated successfully!",
      courseDeleted: "Course deleted successfully!",
      courseEnrolled: "Course enrolled successfully!",
      codeRequired: "Course code is required",
      nameRequired: "Course name is required",
      descriptionHint: "Add a new course with code and name. Students can enroll using the course code.",
      uploadPDF: "Upload PDF for Course",
      choosePDF: "Choose PDF",
      changeFile: "Change File",
      uploadPDFButton: "Upload PDF",
      uploading: "Uploading...",
      showFiles: "Show Files",
      hideFiles: "Hide Files",
      noFiles: "No files uploaded",
      confirmDelete: "Are you sure you want to delete this course? This will deactivate it and students will no longer be able to enroll."
    },
    profile: {
      title: "My Profile",
      subtitle: "Your personal information",
      accountInfo: "Account Information",
      accountDetails: "Your account details",
      fullName: "Full Name",
      dateOfBirth: "Date of Birth",
      notProvided: "Not provided"
    },
    admin: {
      title: "Admin Panel",
      subtitle: "Manage and upload PDF documents for AI assistants",
      uploadGuidelines: "Admin Upload Guidelines",
      guidelines: [
        "Only PDF files are accepted (maximum size: 50MB)",
        "Files will be processed and indexed for AI assistants",
        "Uploaded documents will be available to all users using the assistant",
        "Ensure documents are properly formatted and readable",
        "Delete old files before uploading new versions to save storage"
      ],
      adminAccess: "Admin Access",
      adminAccessDesc: "Admin users can login above with their credentials and will be automatically redirected to the admin panel.",
      success: "Success",
      error: "Error"
    },
    chatHistory: {
      recentChats: "Recent Chats",
      noHistory: "No recent chat history",
      messages: "messages"
    }
  },
  ar: {
    welcome: "مرحباً بك في LovEdu",
    description: "هذا هو الإصدار العربي من الموقع.",
    auth: {
      loginTitle: "تسجيل الدخول",
      signupTitle: "إنشاء حساب",
      welcome: "مرحباً بك في LovEdu",
      noAccount: "ليس لديك حساب؟",
      hasAccount: "لديك حساب بالفعل؟",
      domainRestriction: "الوصول مقصور على أعضاء جامعة الكويت فقط.",
      invalidCredentials: "بريد إلكتروني أو كلمة مرور غير صحيحة",
      accountCreated: "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني للتحقق من حسابك."
    },
    common: {
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      loading: "جاري التحميل...",
      login: "دخول",
      signup: "إنشاء حساب",
      logout: "تسجيل الخروج",
      settings: "الإعدادات",
      newChat: "محادثة جديدة",
      selectAssistant: "اختيار المساعد",
      adminPanel: "لوحة الإدارة",
      typeMessage: "اكتب رسالتك هنا...",
      kuniv: "جامعة الكويت",
      searchChats: "البحث في المحادثات",
      cancel: "إلغاء",
      save: "حفظ",
      delete: "حذف",
      edit: "تعديل",
      create: "إنشاء",
      update: "تحديث",
      upload: "رفع",
      file: "ملف",
      files: "ملفات",
      show: "عرض",
      hide: "إخفاء",
      close: "إغلاق",
      back: "رجوع",
      yes: "نعم",
      no: "لا",
      required: "مطلوب",
      optional: "اختياري",
      refresh: "تحديث",
      selectPDF: "اختر ملف PDF",
      chooseFile: "اختر ملف",
      changeFile: "تغيير الملف",
      uploading: "جاري الرفع...",
      uploadPDF: "رفع ملف PDF",
      selectFileFirst: "اختر ملفاً أولاً",
      filesUploaded: "ملف مرفوع"
    },
    chat: {
      title: "مساعد الذكاء الاصطناعي الجامعي",
      placeholder: "اكتب رسالتك هنا...",
      send: "إرسال",
      thinking: "الذكاء الاصطناعي يفكر...",
      welcome: "مرحباً! أنا مساعد الذكاء الاصطناعي الجامعي. كيف يمكنني مساعدتك اليوم؟",
      assistants: {
        typeX: "مساعد جامعة الكويت",
        references: "مستشار حقوق الطالب",
        academicReferences: "المراجع الأكاديمية",
        therapyGPT: "قصص نجاح",
        whatsTrendy: "الهبات الحالية",
        course: "محادثة المقرر"
      },
      modes: {
        gpt: "Chatgpt",
        perplexity: "Preplexity"
      },
      welcomeMessages: {
        typeX: "مرحباً! أنا LovEdu، مستشارك في جامعة الكويت. أنا هنا لمساعدتك في اللوائح الأكاديمية، والتسجيل، والمعدل التراكمي، ومتطلبات التخرج، والإجراءات الرسمية. كيف يمكنني مساعدتك اليوم؟",
        references: "مرحباً! أنا LovEdu، مستشار حقوق الطالب في جامعة الكويت. أنا هنا لحماية وشرح وتوضيح حقوقك الأكاديمية في جامعة الكويت. يمكنني مساعدتك في الدرجات، والمعدل التراكمي، والاستئنافات، والشكاوى، ومسارات التظلم. كيف يمكنني مساعدتك اليوم؟",
        academicReferences: "مرحباً! أنا LovEdu، مستشار المراجع. أنا خبير في توثيق APA الإصدار السابع، متخصص في متطلبات أطروحة جامعة الكويت. يمكنني مساعدتك في تنسيق المراجع والاقتباسات النصية وفقاً لإرشادات جامعة الكويت. كيف يمكنني مساعدتك اليوم؟",
        therapyGPT: "مرحباً! أنا LovEdu، مستشار قصص النجاح. أنا هنا لمشاركة قصص نجاح حقيقية لطلاب سابقين في جامعة الكويت تغلبوا على التحديات الأكاديمية أو النفسية أو المؤسسية. كيف يمكنني إلهامك وإرشادك اليوم؟",
        whatsTrendy: "مرحباً! أنا LovEdu، مستشار ما هو رائج. أنا هنا لإعلامك بالاتجاهات والأحداث القادمة المتعلقة بحياة الجامعة، وتطوير المسيرة المهنية، والابتكار، والتكنولوجيا، والثقافة، ومشاركة الطلاب. كيف يمكنني مساعدتك في البقاء على اطلاع اليوم؟",
        course: "مرحباً! أنا هنا لمساعدتك في الأسئلة المتعلقة بالمقرر المسجل فيه. كيف يمكنني مساعدتك اليوم؟"
      },
      suggestions: {
        typeX: [
          "كيف أحسب معدلي التراكمي في جامعة الكويت؟",
          "ماذا يحدث إذا كنت تحت المراقبة الأكاديمية؟",
          "ما هي متطلبات التخرج والاعتمادات؟"
        ],
        references: [
          "كيف يمكنني استئناف درجة في جامعة الكويت؟",
          "ما هي حقوقي إذا شعرت أن التقييم غير عادل؟",
          "ما هي عملية الشكوى الرسمية؟"
        ],
        academicReferences: [
          "قم بتنسيق هذا المرجع في APA الإصدار السابع (أطروحة جامعة الكويت): ...",
          "كيف أقوم بتنسيق الاقتباسات النصية؟",
          "ماذا تتطلب جامعة الكويت لقائمة المراجع؟"
        ],
        whatsTrendy: [
          "ما هي الأحداث الرائجة للطلاب هذا الأسبوع؟",
          "هل هناك لقاءات تقنية أو مسابقات برمجية؟",
          "ما الذي يجب أن أحضره لتعزيز مسيرتي المهنية؟"
        ],
        therapyGPT: [
          "شارك قصة نجاح لطالب استعاد معدله التراكمي.",
          "كيف تعامل الآخرون مع الضغط الأكاديمي؟",
          "شارك قصة عن التغلب على المراقبة الأكاديمية."
        ],
        course: [
          "لخص موضوع محاضرة اليوم.",
          "اشرح هذا المفهوم بعبارات بسيطة.",
          "أعطني أسئلة تدريبية حول هذا الموضوع."
        ]
      },
      composer: {
        enterToSend: "Enter للإرسال",
        shiftEnterForNewLine: "Shift+Enter لسطر جديد",
        hint: "Enter للإرسال • Shift+Enter لسطر جديد"
      },
      message: {
        copy: "نسخ",
        copied: "تم النسخ"
      },
      errors: {
        failedToSend: "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.",
        failedToLoadSession: "فشل تحميل جلسة المحادثة",
        failedToLoadSessions: "فشل تحميل جلسات المحادثة"
      }
    },
    subscribe: {
      title: "اختر خطتك",
      description: "اختر خطة اشتراك للوصول إلى استوديو الذكاء الاصطناعي",
      activateWithPayPal: "تفعيل مع PayPal",
      plans: {
        basic: {
          name: "الخطة الأساسية",
          price: "$9.99/شهر"
        },
        premium: {
          name: "الخطة المميزة",
          price: "$19.99/شهر"
        }
      }
    },
    course: {
      title: "إدارة المقررات",
      create: "إنشاء مقرر",
      createNew: "إنشاء مقرر جديد",
      createButton: "إنشاء المقرر",
      creating: "جاري إنشاء المقرر...",
      update: "تحديث المقرر",
      deleting: "جاري حذف المقرر...",
      delete: "حذف المقرر",
      code: "رمز المقرر",
      name: "اسم المقرر",
      description: "الوصف",
      myCourses: "مقرراتي",
      addCourse: "إضافة مقرر",
      enrollCourse: "التسجيل في المقرر",
      enrolling: "جاري التسجيل...",
      enrolled: "تم التسجيل",
      enroll: "التسجيل",
      noCourses: "لا توجد مقررات. قم بإنشاء أول مقرر أعلاه.",
      loadingCourses: "جاري تحميل المقررات...",
      browseOrEnterCode: "تصفح المقررات المتاحة أو أدخل رمز المقرر",
      availableCourses: "المقررات المتاحة",
      enterCodeInstead: "أدخل الرمز بدلاً من ذلك",
      noCoursesAvailable: "لا توجد مقررات متاحة حالياً",
      enterCourseCode: "أدخل رمز المقرر",
      browseCourses: "تصفح المقررات",
      codePlaceholder: "أدخل رمز المقرر (مثال: CM101)",
      courseCreated: "تم إنشاء المقرر بنجاح!",
      courseUpdated: "تم تحديث المقرر بنجاح!",
      courseDeleted: "تم حذف المقرر بنجاح!",
      courseEnrolled: "تم التسجيل في المقرر بنجاح!",
      codeRequired: "رمز المقرر مطلوب",
      nameRequired: "اسم المقرر مطلوب",
      descriptionHint: "أضف مقرراً جديداً برمز واسم. يمكن للطلاب التسجيل باستخدام رمز المقرر.",
      uploadPDF: "رفع ملف PDF للمقرر",
      choosePDF: "اختر ملف PDF",
      changeFile: "تغيير الملف",
      uploadPDFButton: "رفع ملف PDF",
      uploading: "جاري الرفع...",
      showFiles: "عرض الملفات",
      hideFiles: "إخفاء الملفات",
      noFiles: "لا توجد ملفات مرفوعة",
      confirmDelete: "هل أنت متأكد من حذف هذا المقرر؟ سيؤدي ذلك إلى تعطيله ولن يتمكن الطلاب من التسجيل."
    },
    profile: {
      title: "ملفي الشخصي",
      subtitle: "معلوماتك الشخصية",
      accountInfo: "معلومات الحساب",
      accountDetails: "تفاصيل حسابك",
      fullName: "الاسم الكامل",
      dateOfBirth: "تاريخ الميلاد",
      notProvided: "غير متوفر"
    },
    admin: {
      title: "لوحة الإدارة",
      subtitle: "إدارة ورفع مستندات PDF للمساعدين الذكيين",
      uploadGuidelines: "إرشادات رفع الملفات للمشرف",
      guidelines: [
        "يُقبل فقط ملفات PDF (الحد الأقصى: 50 ميجابايت)",
        "سيتم معالجة الملفات وفهرستها للمساعدين الذكيين",
        "ستكون المستندات المرفوعة متاحة لجميع المستخدمين الذين يستخدمون المساعد",
        "تأكد من أن المستندات منسقة بشكل صحيح وقابلة للقراءة",
        "احذف الملفات القديمة قبل رفع إصدارات جديدة لتوفير مساحة التخزين"
      ],
      adminAccess: "وصول المشرف",
      adminAccessDesc: "يمكن للمستخدمين المشرفين تسجيل الدخول أعلاه باستخدام بيانات اعتمادهم وسيتم إعادة توجيههم تلقائياً إلى لوحة الإدارة.",
      success: "نجاح",
      error: "خطأ"
    },
    chatHistory: {
      recentChats: "المحادثات الأخيرة",
      noHistory: "لا يوجد تاريخ محادثات حديث",
      messages: "رسالة"
    }
  }
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en

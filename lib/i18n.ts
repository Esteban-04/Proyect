

export const translations = {
  es: {
    // Login & Register & Reset
    welcomeMessage: 'Bienvenido a nuestro sistema',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    loginButton: 'ACCESO',
    forgotPasswordButton: '¿Olvidaste tu contraseña?',
    registerPrompt: '¿Aún no tienes una cuenta? Regístrate',
    registerLink: 'aquí',
    loginErrorIncorrectCredentials: 'Usuario o contraseña incorrectos.',
    resetPasswordTitle: 'Restablecer Contraseña',
    resetSubheading: 'Ingresa tu correo electrónico para continuar.',
    sendLinkButton: 'ENVIAR ENLACE',
    resetSuccessMessage: (email: string) => `Si una cuenta con el correo ${email} existe, se ha enviado un enlace para restablecer la contraseña.`,
    backToLoginLink: 'Volver a Iniciar sesión',
    createAccountTitle: 'Crear una Cuenta',
    registerSubheading: 'Completa tus datos para registrarte.',
    fullNamePlaceholder: 'Nombre completo',
    emailPlaceholder: 'Correo electrónico',
    passwordPlaceholder: 'Contraseña',
    registerButton: 'REGISTRARSE',
    registerSuccessMessage: '¡Registro exitoso! Se ha enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada.',
    registerErrorEmailExists: 'Este correo electrónico ya está registrado.',

    // Main App
    logoutButton: 'Cerrar Sesión',
    selectBrandTitle: 'Selecciona una empresa para continuar',
    allCountriesTitle: 'Todos los países',
    selectClubPrompt: 'Selecciona una sede para continuar.',
    backButton: 'Volver',
    noLocationsMessage: 'No hay sedes de DHL disponibles por el momento.',

    // Final Selection
    remoteDesktopLabel: 'Escritorio Remoto:',
    userLabel: 'Usuario:',
    finalPasswordLabel: 'Contraseña:',
    idLabel: 'ID:',
    
    // Modal Details
    modalTitle: 'Detalles del Servidor 01 - Barranquilla',
    colIndex: '#',
    colName: 'Nombre',
    colIp: 'Dirección IP',
    colManufacturer: 'Fabricante',
    colUser: 'Usuario',
    colPassword: 'Contraseña',
    colCompression: 'Compresión',
    closeButton: 'Cerrar',
    saveButton: 'Guardar',
    saveSuccess: '¡Cambios guardados exitosamente!',
    okButton: 'Aceptar',
    searchPlaceholder: 'Buscar por Nombre o IP...',
  },
  en: {
    // Login & Register & Reset
    welcomeMessage: 'Welcome to our system',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    loginButton: 'ACCESS',
    forgotPasswordButton: 'Forgot your password?',
    registerPrompt: "Don't have an account yet? Register",
    registerLink: 'here',
    loginErrorIncorrectCredentials: 'Incorrect username or password.',
    resetPasswordTitle: 'Reset Password',
    resetSubheading: 'Enter your email to continue.',
    sendLinkButton: 'SEND LINK',
    resetSuccessMessage: (email: string) => `If an account with the email ${email} exists, a password reset link has been sent.`,
    backToLoginLink: 'Back to Login',
    createAccountTitle: 'Create an Account',
    registerSubheading: 'Complete your details to register.',
    fullNamePlaceholder: 'Full name',
    emailPlaceholder: 'Email address',
    passwordPlaceholder: 'Password',
    registerButton: 'REGISTER',
    registerSuccessMessage: 'Registration successful! A confirmation email has been sent. Please check your inbox.',
    registerErrorEmailExists: 'This email address is already registered.',

    // Main App
    logoutButton: 'Logout',
    selectBrandTitle: 'Select a company to continue',
    allCountriesTitle: 'All countries',
    selectClubPrompt: 'Select a location to continue.',
    backButton: 'Back',
    noLocationsMessage: 'No DHL locations are available at this time.',

    // Final Selection
    remoteDesktopLabel: 'Remote Desktop:',
    userLabel: 'User:',
    finalPasswordLabel: 'Password:',
    idLabel: 'ID:',

    // Modal Details
    modalTitle: 'Server 01 Details - Barranquilla',
    colIndex: '#',
    colName: 'Name',
    colIp: 'IP Address',
    colManufacturer: 'Manufacturer',
    colUser: 'User Name',
    colPassword: 'Password',
    colCompression: 'Compression',
    closeButton: 'Close',
    saveButton: 'Save',
    saveSuccess: 'Changes saved successfully!',
    okButton: 'OK',
    searchPlaceholder: 'Search by Name or IP...',
  },
};

export type Language = keyof typeof translations;

export const translations = {
  es: {
    // Login & Register & Reset
    welcomeMessage: 'Bienvenido a nuestro sistema de soporte',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'contraseña',
    loginButton: 'ACCESO',
    forgotPasswordButton: '¿HAS OLVIDADO TU CONTRASEÑA?',
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
    registerSuccessMessage: '¡Registro exitoso! Ahora puedes iniciar sesión.',
    registerErrorEmailExists: 'Este correo electrónico ya está registrado.',

    // Main App
    logoutButton: 'Cerrar Sesión',
    allCountriesTitle: 'Todos los países',
    selectClubPrompt: 'Selecciona una sede para continuar.',
    backButton: 'Volver',

    // Final Selection
    remoteDesktopLabel: 'Escritorio Remoto:',
    userLabel: 'Usuario:',
    finalPasswordLabel: 'Contraseña:',
    idLabel: 'ID:',
  },
  en: {
    // Login & Register & Reset
    welcomeMessage: 'Welcome to our support system',
    emailLabel: 'Email address',
    passwordLabel: 'password',
    loginButton: 'ACCESS',
    forgotPasswordButton: 'FORGOT YOUR PASSWORD?',
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
    registerSuccessMessage: 'Registration successful! You can now log in.',
    registerErrorEmailExists: 'This email address is already registered.',

    // Main App
    logoutButton: 'Logout',
    allCountriesTitle: 'All countries',
    selectClubPrompt: 'Select a location to continue.',
    backButton: 'Back',

    // Final Selection
    remoteDesktopLabel: 'Remote Desktop:',
    userLabel: 'User:',
    finalPasswordLabel: 'Password:',
    idLabel: 'ID:',
  },
};

export type Language = keyof typeof translations;

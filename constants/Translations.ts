import { Language } from './Languages';

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    delete: string;
    save: string;
    edit: string;
    add: string;
    remove: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    retry: string;
    refresh: string;
    search: string;
    filter: string;
    sort: string;
    more: string;
    less: string;
    on: string;
    off: string;
    yes: string;
    no: string;
    ok: string;
    unknown: string;
  };

  // Connection Status
  connection: {
    connected: string;
    connecting: string;
    disconnected: string;
    connectionError: string;
    connectionSuccess: string;
    checkInternetConnection: string;
  };

  // Navigation
  navigation: {
    home: string;
    settings: string;
    profile: string;
    projects: string;
    relays: string;
  };

  // Home Screen
  home: {
    welcome: string;
    createFirstProject: string;
    enterProjectName: string;
    createProject: string;
    projectName: string;
    noRelays: string;
    addRelay: string;
    relayName: string;
    addNewRelay: string;
    enterRelayName: string;
    renameRelay: string;
    enterNewRelayName: string;
    relayAdded: string;
    relayRenamed: string;
    relayDeleted: string;
    confirmDeleteRelay: string;
    deleteRelayMessage: string;
    noRelaysToDelete: string;
    relayStateOn: string;
    relayStateOff: string;
    toggleRelay: string;
    lastUpdated: string;
    refreshRelays: string;
  };

  // Settings Screen
  settings: {
    title: string;
    account: string;
    profile: string;
    email: string;
    phone: string;
    signUpMethod: string;
    project: string;
    projectName: string;
    renameProject: string;
    enterNewProjectName: string;
    projectRenamed: string;
    connection: string;
    connectionStatus: string;
    autoConnect: string;
    manualConnect: string;
    notifications: string;
    pushNotifications: string;
    emailNotifications: string;
    language: string;
    selectLanguage: string;
    app: string;
    darkMode: string;
    useDarkTheme: string;
    appVersion: string;
    deleteRelay: string;
    deleteRelaySubtitle: string;
    about: string;
    aboutSubtitle: string;
    aboutMessage: string;
    signOut: string;
    signOutConfirm: string;
    signOutMessage: string;
    noRelaysAvailable: string;
    renameRequiresIOS: string;
    renameRequiresIOSMessage: string;
  };

  // Auth Screens
  auth: {
    signIn: string;
    signUp: string;
    signInToAlemdar: string;
    welcomeBack: string;
    signInToContinue: string;
    signInWithGoogle: string;
    createAccount: string;
    welcome: string;
    fillDetailsToStart: string;
    signUpWithGoogle: string;
    or: string;
    phoneNumber: string;
    enterPhoneNumber: string;
    password: string;
    verificationCode: string;
    enterVerificationCode: string;
    verify: string;
    resendCode: string;
    codeSent: string;
    invalidPhoneNumber: string;
    invalidCode: string;
    signInError: string;
    signUpError: string;
    verificationError: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
  };

  // Alerts and Messages
  alerts: {
    error: string;
    success: string;
    warning: string;
    info: string;
    confirmAction: string;
    actionCannotBeUndone: string;
    noProjectFound: string;
    noRelaysFound: string;
    networkError: string;
    tryAgain: string;
    somethingWentWrong: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      save: 'Save',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      retry: 'Retry',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      more: 'More',
      less: 'Less',
      on: 'On',
      off: 'Off',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      unknown: 'Unknown',
    },
    connection: {
      connected: 'Connected',
      connecting: 'Connecting...',
      disconnected: 'Disconnected',
      connectionError: 'Connection Error',
      connectionSuccess: 'Successfully connected to Supabase!',
      checkInternetConnection: 'Failed to connect. Please check your internet connection and try again.',
    },
    navigation: {
      home: 'Home',
      settings: 'Settings',
      profile: 'Profile',
      projects: 'Projects',
      relays: 'Relays',
    },
    home: {
      welcome: 'Welcome',
      createFirstProject: 'Create your first project to get started',
      enterProjectName: 'Enter project name',
      createProject: 'Create Project',
      projectName: 'Project Name',
      noRelays: 'No relays found',
      addRelay: 'Add Relay',
      relayName: 'Relay Name',
      addNewRelay: 'Add New Relay',
      enterRelayName: 'Enter a name for your new relay',
      renameRelay: 'Rename Relay',
      enterNewRelayName: 'Enter a new name for this relay',
      relayAdded: 'Relay added successfully',
      relayRenamed: 'Relay renamed successfully',
      relayDeleted: 'Relay deleted successfully',
      confirmDeleteRelay: 'Confirm Delete',
      deleteRelayMessage: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
      noRelaysToDelete: 'There are no relays to delete.',
      relayStateOn: 'ON',
      relayStateOff: 'OFF',
      toggleRelay: 'Toggle Relay',
      lastUpdated: 'Last updated',
      refreshRelays: 'Pull to refresh',
    },
    settings: {
      title: 'Settings',
      account: 'Account',
      profile: 'Profile',
      email: 'Email',
      phone: 'Phone',
      signUpMethod: 'Sign Up Method',
      project: 'Project',
      projectName: 'Project Name',
      renameProject: 'Rename Project',
      enterNewProjectName: 'Enter new project name:',
      projectRenamed: 'Project renamed successfully',
      connection: 'Connection',
      connectionStatus: 'Connection Status',
      autoConnect: 'Auto Connect',
      manualConnect: 'Manual Connect',
      notifications: 'Notifications',
      pushNotifications: 'Push Notifications',
      emailNotifications: 'Email Notifications',
      language: 'Language',
      selectLanguage: 'Select Language',
      app: 'App',
      darkMode: 'Dark Mode',
      useDarkTheme: 'Use dark theme',
      appVersion: 'App Version',
      deleteRelay: 'Delete Relay',
      deleteRelaySubtitle: 'Delete a relay ({count} available)',
      about: 'About',
      aboutSubtitle: 'Relay Control App',
      aboutMessage: 'Relay Control App\nVersion 1.0.0\n\nControl your devices with ease.',
      signOut: 'Sign Out',
      signOutConfirm: 'Sign Out',
      signOutMessage: 'Are you sure you want to sign out?',
      noRelaysAvailable: 'No relays available',
      renameRequiresIOS: 'Rename Project',
      renameRequiresIOSMessage: 'Rename functionality requires iOS. Please use the web interface to rename your project.',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signInToAlemdar: 'Sign in to Alemdar Controler',
      welcomeBack: 'Welcome back! Please sign in to continue',
      signInToContinue: 'Sign in to continue',
      signInWithGoogle: 'Sign in with Google',
      createAccount: 'Create your account',
      welcome: 'Welcome! Please fill in the details to get started',
      fillDetailsToStart: 'Please fill in the details to get started',
      signUpWithGoogle: 'Sign up with Google',
      or: 'or',
      phoneNumber: 'Phone Number',
      enterPhoneNumber: 'Enter your phone number',
      password: 'Password',
      verificationCode: 'Verification Code',
      enterVerificationCode: 'Enter the verification code',
      verify: 'Verify',
      resendCode: 'Resend Code',
      codeSent: 'Code sent to your phone',
      invalidPhoneNumber: 'Invalid phone number',
      invalidCode: 'Invalid verification code',
      signInError: 'Sign in failed',
      signUpError: 'Sign up failed',
      verificationError: 'Verification failed',
      dontHaveAccount: 'Don\'t have an account?',
      alreadyHaveAccount: 'Already have an account?',
    },
    alerts: {
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      confirmAction: 'Confirm Action',
      actionCannotBeUndone: 'This action cannot be undone.',
      noProjectFound: 'No project found.',
      noRelaysFound: 'No relays found.',
      networkError: 'Network error',
      tryAgain: 'Please try again.',
      somethingWentWrong: 'Something went wrong.',
    },
  },
  tr: {
    common: {
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
      cancel: 'İptal',
      confirm: 'Onayla',
      delete: 'Sil',
      save: 'Kaydet',
      edit: 'Düzenle',
      add: 'Ekle',
      remove: 'Kaldır',
      close: 'Kapat',
      back: 'Geri',
      next: 'İleri',
      previous: 'Önceki',
      retry: 'Tekrar Dene',
      refresh: 'Yenile',
      search: 'Ara',
      filter: 'Filtrele',
      sort: 'Sırala',
      more: 'Daha Fazla',
      less: 'Daha Az',
      on: 'Açık',
      off: 'Kapalı',
      yes: 'Evet',
      no: 'Hayır',
      ok: 'Tamam',
      unknown: 'Bilinmiyor',
    },
    connection: {
      connected: 'Bağlı',
      connecting: 'Bağlanıyor...',
      disconnected: 'Bağlantı Kesildi',
      connectionError: 'Bağlantı Hatası',
      connectionSuccess: 'Supabase\'e başarıyla bağlandı!',
      checkInternetConnection: 'Bağlantı başarısız. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.',
    },
    navigation: {
      home: 'Ana Sayfa',
      settings: 'Ayarlar',
      profile: 'Profil',
      projects: 'Projeler',
      relays: 'Röleler',
    },
    home: {
      welcome: 'Hoş Geldiniz',
      createFirstProject: 'Başlamak için ilk projenizi oluşturun',
      enterProjectName: 'Proje adını girin',
      createProject: 'Proje Oluştur',
      projectName: 'Proje Adı',
      noRelays: 'Röle bulunamadı',
      addRelay: 'Röle Ekle',
      relayName: 'Röle Adı',
      addNewRelay: 'Yeni Röle Ekle',
      enterRelayName: 'Yeni röleniz için bir ad girin',
      renameRelay: 'Röleyi Yeniden Adlandır',
      enterNewRelayName: 'Bu röle için yeni bir ad girin',
      relayAdded: 'Röle başarıyla eklendi',
      relayRenamed: 'Röle başarıyla yeniden adlandırıldı',
      relayDeleted: 'Röle başarıyla silindi',
      confirmDeleteRelay: 'Silme Onayı',
      deleteRelayMessage: '"{name}" adlı röleyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      noRelaysToDelete: 'Silinecek röle bulunmuyor.',
      relayStateOn: 'AÇIK',
      relayStateOff: 'KAPALI',
      toggleRelay: 'Röleyi Değiştir',
      lastUpdated: 'Son güncelleme',
      refreshRelays: 'Yenilemek için çekin',
    },
    settings: {
      title: 'Ayarlar',
      account: 'Hesap',
      profile: 'Profil',
      email: 'E-posta',
      phone: 'Telefon',
      signUpMethod: 'Kayıt Yöntemi',
      project: 'Proje',
      projectName: 'Proje Adı',
      renameProject: 'Projeyi Yeniden Adlandır',
      enterNewProjectName: 'Yeni proje adını girin:',
      projectRenamed: 'Proje başarıyla yeniden adlandırıldı',
      connection: 'Bağlantı',
      connectionStatus: 'Bağlantı Durumu',
      autoConnect: 'Otomatik Bağlan',
      manualConnect: 'Manuel Bağlan',
      notifications: 'Bildirimler',
      pushNotifications: 'Push Bildirimleri',
      emailNotifications: 'E-posta Bildirimleri',
      language: 'Dil',
      selectLanguage: 'Dil Seçin',
      app: 'Uygulama',
      darkMode: 'Karanlık Mod',
      useDarkTheme: 'Karanlık tema kullan',
      appVersion: 'Uygulama Sürümü',
      deleteRelay: 'Röle Sil',
      deleteRelaySubtitle: 'Bir röle sil ({count} mevcut)',
      about: 'Hakkında',
      aboutSubtitle: 'Röle Kontrol Uygulaması',
      aboutMessage: 'Röle Kontrol Uygulaması\nSürüm 1.0.0\n\nCihazlarınızı kolayca kontrol edin.',
      signOut: 'Çıkış Yap',
      signOutConfirm: 'Çıkış Yap',
      signOutMessage: 'Çıkış yapmak istediğinizden emin misiniz?',
      noRelaysAvailable: 'Mevcut röle yok',
      renameRequiresIOS: 'Projeyi Yeniden Adlandır',
      renameRequiresIOSMessage: 'Yeniden adlandırma işlevi iOS gerektirir. Lütfen projenizi yeniden adlandırmak için web arayüzünü kullanın.',
    },
    auth: {
      signIn: 'Giriş Yap',
      signUp: 'Kayıt Ol',
      signInToAlemdar: 'Alemdar Controler\'a giriş yapın',
      welcomeBack: 'Tekrar hoş geldiniz! Devam etmek için giriş yapın',
      signInToContinue: 'Devam etmek için giriş yapın',
      signInWithGoogle: 'Google ile giriş yap',
      createAccount: 'Hesabınızı oluşturun',
      welcome: 'Hoş geldiniz! Başlamak için detayları doldurun',
      fillDetailsToStart: 'Başlamak için detayları doldurun',
      signUpWithGoogle: 'Google ile kayıt ol',
      or: 'veya',
      phoneNumber: 'Telefon Numarası',
      enterPhoneNumber: 'Telefon numaranızı girin',
      password: 'Şifre',
      verificationCode: 'Doğrulama Kodu',
      enterVerificationCode: 'Doğrulama kodunu girin',
      verify: 'Doğrula',
      resendCode: 'Kodu Tekrar Gönder',
      codeSent: 'Kod telefonunuza gönderildi',
      invalidPhoneNumber: 'Geçersiz telefon numarası',
      invalidCode: 'Geçersiz doğrulama kodu',
      signInError: 'Giriş başarısız',
      signUpError: 'Kayıt başarısız',
      verificationError: 'Doğrulama başarısız',
      dontHaveAccount: 'Hesabınız yok mu?',
      alreadyHaveAccount: 'Zaten bir hesabınız var mı?',
    },
    alerts: {
      error: 'Hata',
      success: 'Başarılı',
      warning: 'Uyarı',
      info: 'Bilgi',
      confirmAction: 'İşlemi Onayla',
      actionCannotBeUndone: 'Bu işlem geri alınamaz.',
      noProjectFound: 'Proje bulunamadı.',
      noRelaysFound: 'Röle bulunamadı.',
      networkError: 'Ağ hatası',
      tryAgain: 'Lütfen tekrar deneyin.',
      somethingWentWrong: 'Bir şeyler yanlış gitti.',
    },
  },
}; 
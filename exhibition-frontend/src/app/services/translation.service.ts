import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TranslationKeys {
  [key: string]: string | TranslationKeys;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly LANGUAGE_KEY = 'exhibition-language';
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$: Observable<string> = this.currentLanguageSubject.asObservable();

  private translations: { [lang: string]: TranslationKeys } = {
    en: {
      // Landing Page
      'welcome.title': 'Welcome to the Exhibition Management System',
      'welcome.subtitle': 'Discover amazing products, connect with exhibitors, and experience innovation at its finest',
      'welcome.register': 'Register as Attendee',
      'welcome.login': 'Login',
      
      // Common
      'common.sponsors': 'Our Sponsors',
      'common.exhibitors': 'Featured Exhibitors',
      'common.products': 'Featured Products',
      'common.conferences': 'Upcoming Conferences',
      'common.booth': 'Booth',
      'common.floor': 'Floor',
      'common.search': 'Search',
      'common.searchExhibition': 'Search Exhibition',
      'common.searchPlaceholder': 'Search exhibitors, sponsors, or partners...',
      'common.refresh': 'Refresh',
      'common.logout': 'Log Out',
      'common.loading': 'Loading...',
      'common.noResults': 'No results found',
      'common.actions': 'Actions',
      
      // Login
      'login.title': 'Login',
      'login.email': 'Email',
      'login.password': 'Password',
      'login.signIn': 'Sign In',
      'login.signingIn': 'Signing In...',
      'login.forgotPassword': 'Forgot Password?',
      'login.registerAttendee': 'Register as Attendee',
      'login.registerExhibitor': 'Register as Exhibitor',
      'login.noAccount': "Don't have an account?",
      'login.loginSuccess': 'Login successful!',
      'login.loginFailed': 'Login failed. Please check your credentials.',
      'login.fillFields': 'Please fill in all fields',
      
      // Attendee Dashboard
      'attendee.welcome': 'Welcome',
      'attendee.explore': 'Explore',
      'attendee.profile': 'Profile',
      'attendee.totalExhibitors': 'Total Exhibitors',
      'attendee.totalSponsors': 'Total Sponsors',
      'attendee.totalPartners': 'Total Partners',
      'attendee.exhibitorsByFloor': 'Exhibitors by Floor',
      'attendee.ourSponsors': 'Our Sponsors',
      'attendee.ourPartners': 'Our Partners',
      'attendee.quickActions': 'Quick Actions',
      'attendee.viewProducts': 'View Products',
      'attendee.hideProducts': 'Hide Products',
      'attendee.noProducts': 'No products available',
      'attendee.loadingProducts': 'Loading products...',
      'attendee.exhibitor': 'exhibitor(s)',
      
      // Profile
      'profile.editProfile': 'Edit Profile',
      'profile.changePassword': 'Change Password',
      'profile.personalInfo': 'Personal Information',
      'profile.fullName': 'Full Name',
      'profile.email': 'Email',
      'profile.phone': 'Phone',
      'profile.paymentInformation': 'Payment Information',
      'profile.paymentFee': 'Payment Fee',
      'profile.noPaymentInfo': 'No payment information available',
      'profile.notProvided': 'Not provided',
      'profile.loadingProfile': 'Loading profile...',
      'profile.changePasswordTitle': 'Change Password',
      'profile.changePasswordDescription': 'For security reasons, please change your temporary password to a secure one.',
      'profile.newPassword': 'New Password',
      'profile.confirmPassword': 'Confirm Password',
      'profile.confirmNewPassword': 'Confirm New Password',
      'profile.enterNewPassword': 'Enter new password',
      'profile.confirmNewPasswordPlaceholder': 'Confirm new password',
      'profile.passwordRequired': 'Password is required',
      'profile.passwordMinLength': 'Password must be at least 6 characters',
      'profile.confirmRequired': 'Please confirm your password',
      'profile.passwordsDoNotMatch': 'Passwords do not match',
      'profile.passwordsMatch': 'Passwords match',
      'profile.changing': 'Changing...',
      'profile.passwordRequirements': 'Password Requirements:',
      'profile.reqMinLength': 'At least 6 characters long',
      'profile.reqLetter': 'Must contain at least one letter',
      'profile.reqNumber': 'Must contain at least one number',
      'profile.editProfileTitle': 'Edit Profile',
      'profile.profilePhoto': 'Profile Photo',
      'profile.companyLogo': 'Company Logo',
      'profile.enterFullName': 'Enter your full name',
      'profile.enterEmail': 'Enter email address',
      'profile.enterPhone': 'Enter phone number',
      'profile.enterCompanyName': 'Enter company name',
      'profile.enterContactPerson': 'Enter contact person name',
      'profile.nameRequired': 'Name is required',
      'profile.emailRequired': 'Email is required',
      'profile.validEmail': 'Please enter a valid email address',
      'profile.nameMaxLength': 'Name cannot exceed 100 characters',
      'profile.emailMaxLength': 'Email cannot exceed 100 characters',
      'profile.phoneRequired': 'Phone number is required',
      'profile.phoneMaxLength': 'Phone number cannot exceed 20 characters',
      'profile.companyNameRequired': 'Company name is required',
      'profile.contactPersonRequired': 'Contact person is required',
      'profile.companyMaxLength': 'Company name cannot exceed 100 characters',
      'profile.contactMaxLength': 'Contact person name cannot exceed 100 characters',
      
      // Footer
      'footer.copyright': 'Exhibition Management System. All rights reserved.',
      'footer.contactUs': 'Contact Us',
      
      // Conference
      'conference.schedule': 'Schedule',
      'conference.location': 'Location',
      'conference.speaker': 'Speaker',
      
      // Messages
      'message.loggedOut': 'You have been logged out successfully',
      'message.registerSuccess': 'Registration successful',
      
      // Errors
      'error.loadFailed': 'Failed to load',
      'error.noData': 'No data available at the moment',
      
      // Contact
      'contact.address': 'Ethiopian IT Park, BPO, Floor 7',
      'contact.addressLine2': '',
      'contact.phone': '+251965586329',
      'contact.email': 'dagimawitkelem129@gmail.com',
      'contact.hours': 'Mon-Fri: 9:00AM - 6:00PM',
      'contact.hoursWeekend': 'Sat-Sun: 9:00AM - 12:00AM',
      
      // Forgot Password
      'forgotPassword.title': 'Forgot Password?',
      'forgotPassword.description': 'Enter your email address and we\'ll help you recover your account.',
      'forgotPassword.email': 'Email Address',
      'forgotPassword.emailPlaceholder': 'Enter your email',
      'forgotPassword.emailRequired': 'Email is required',
      'forgotPassword.emailInvalid': 'Please enter a valid email',
      'forgotPassword.cancel': 'Cancel',
      'forgotPassword.sending': 'Sending...',
      'forgotPassword.sendReset': 'Send Reset Instructions',
      'forgotPassword.helpTitle': 'For Exhibitors & Attendees:',
      'forgotPassword.helpText': 'We\'ll send password reset instructions to your email.',
      'forgotPassword.success': 'Password reset email sent to {{email}}. Please check your email for the new password.',
      'forgotPassword.failed': 'Failed to send password reset email. Please try again or contact support.',
      'forgotPassword.emailNotFound': 'Email address not found in our system. Please check your email or contact support.',
      'forgotPassword.error': 'An error occurred while processing your request. Please try again.',
      
      // Admin Dashboard
      'admin.dashboard': 'Admin Dashboard',
      'admin.users': 'Users',
      'admin.exhibitors': 'Exhibitors',
      'admin.sponsors': 'Sponsors',
      'admin.partners': 'Partners',
      'admin.products': 'Products',
      'admin.speakers': 'Speakers',
      'admin.conferences': 'Conferences',
      'admin.floors': 'Floors',
      'admin.addUser': 'Add User',
      'admin.addExhibitor': 'Add Exhibitor',
      'admin.addSponsor': 'Add Sponsor',
      'admin.addPartner': 'Add Partner',
      'admin.addProduct': 'Add Product',
      'admin.addSpeaker': 'Add Speaker',
      'admin.addConference': 'Add Conference',
      'admin.edit': 'Edit',
      'admin.delete': 'Delete',
      'admin.name': 'Name',
      'admin.email': 'Email',
      'admin.role': 'Role',
      'admin.status': 'Status',
      'admin.companyName': 'Company Name',
      'admin.boothNumber': 'Booth Number',
      'admin.floorNumber': 'Floor Number',
      'admin.contactPerson': 'Contact Person',
      'admin.logoUrl': 'Logo URL',
      'admin.benefits': 'Benefits',
      'admin.partnershipType': 'Partnership Type',
      'admin.productName': 'Product Name',
      'admin.category': 'Category',
      'admin.description': 'Description',
      'admin.imageUrl': 'Image URL',
      'admin.title': 'Title',
      'admin.bio': 'Bio',
      'admin.schedule': 'Schedule',
      'admin.location': 'Location',
      'admin.active': 'Active',
      'admin.inactive': 'Inactive',
      'admin.requestPayment': 'Request Payment',
      'admin.openPaymentLink': 'Open Payment Link',
      'admin.toggleStatus': 'Toggle Status',
      'admin.attendees': 'Attendees',
      'admin.database': 'Database',
      'admin.dashboardOverview': 'Dashboard Overview',
      'admin.welcomeMessage': 'Welcome to the Exhibition Management System',
      'admin.totalAttendees': 'Total Attendees',
      'admin.totalExhibitors': 'Total Exhibitors',
      'admin.totalProducts': 'Total Products',
      'admin.totalConferences': 'Total Conferences',
      'admin.totalSpeakers': 'Total Speakers',
      'admin.totalSponsors': 'Total Sponsors',
      'admin.totalPartners': 'Total Partners',
      'admin.attendeeManagement': 'Attendee Management',
      'admin.exhibitorManagement': 'Exhibitor Management',
      'admin.sponsorManagement': 'Sponsor Management',
      'admin.partnerManagement': 'Partner Management',
      'admin.productManagement': 'Product Management',
      'admin.speakerManagement': 'Speaker Management',
      'admin.conferenceManagement': 'Conference Management',
      'admin.noAttendeesFound': 'No Attendees Found',
      'admin.attendeesAppearHere': 'Attendees will appear here once they register',
      'admin.addFirstExhibitor': 'Add your first exhibitor to get started',
      'admin.noSponsorsFound': 'No Sponsors Found',
      'admin.noPartnersFound': 'No Partners Found',
      'admin.noProductsFound': 'No Products Found',
      'admin.noSpeakersFound': 'No Speakers Found',
      'admin.noConferencesFound': 'No Conferences Found',
      'admin.addFirstSponsor': 'Add your first sponsor to get started',
      'admin.addFirstPartner': 'Add your first partner to get started',
      'admin.addFirstProduct': 'Add your first product to get started',
      'admin.addFirstSpeaker': 'Add your first speaker to get started',
      'admin.addFirstConference': 'Add your first conference to get started',
      'admin.phone': 'Phone',
      'admin.floor': 'Floor',
      'admin.productIds': 'Product IDs',
      'admin.contribution': 'Contribution',
      'admin.activate': 'Activate',
      'admin.deactivate': 'Deactivate',
      'admin.date': 'Date',
      'admin.time': 'Time',
      'admin.speaker': 'Speaker',
      'admin.organization': 'Organization',
      'admin.expertise': 'Expertise',
      'admin.image': 'Image',
      'admin.adminUser': 'Admin User',
      
      // User Management Status
      'userManagement.statusActive': 'Active',
      'userManagement.statusInactive': 'Inactive',
      'userManagement.statusSuspended': 'Suspended',
      
      // Exhibitor Dashboard
      'exhibitor.dashboard': 'Exhibitor Dashboard',
      'exhibitor.products': 'My Products',
      'exhibitor.addProduct': 'Add Product',
      'exhibitor.noProducts': 'No products available. Add your first product!',
      'exhibitor.profile': 'Profile',
      'exhibitor.personalInfo': 'Personal Information',
      'exhibitor.fullName': 'Full Name',
      'exhibitor.phone': 'Phone',
      'exhibitor.company': 'Company',
      'exhibitor.booth': 'Booth',
      'exhibitor.floor': 'Floor',
      'exhibitor.changePassword': 'Change Password',
      'exhibitor.editProfile': 'Edit Profile',
      'exhibitor.contactPerson': 'Contact Person',
      'exhibitor.email': 'Email',
      'exhibitor.status': 'Status',
      'exhibitor.boothInformation': 'Booth Information',
      'exhibitor.floorFeatures': 'Floor Features:',
      'exhibitor.layout': 'Layout',
      'exhibitor.available': 'Available',
      'exhibitor.notAvailable': 'Not available',
      'exhibitor.exhibitorsCount': 'Exhibitors',
      
      // Attendee - Additional
      'attendee.productName': 'Product Name',
      'attendee.productCategory': 'Category',
      'attendee.productDescription': 'Description',
      'attendee.sponsorBenefits': 'Benefits',
      'attendee.partnerBenefits': 'Benefits',
      'attendee.partnershipType': 'Partnership Type',
      
      // Common Form
      'form.submit': 'Submit',
      'form.cancel': 'Cancel',
      'form.save': 'Save',
      'form.close': 'Close',
      'form.delete': 'Delete',
      'form.edit': 'Edit',
      'form.add': 'Add',
      'form.required': 'Required',
      'form.invalid': 'Invalid',
      'form.loading': 'Loading...',
      'form.success': 'Success',
      'form.error': 'Error',
      
      // Exhibitor Form
      'form.addExhibitor': 'Add Exhibitor',
      'form.editExhibitor': 'Edit Exhibitor',
      'form.updateExhibitor': 'Update Exhibitor',
      'form.companyName': 'Company Name',
      'form.companyNameRequired': 'Company name is required',
      'form.companyNameMaxLength': 'Company name cannot exceed 100 characters',
      'form.contactPerson': 'Contact Person',
      'form.contactPersonRequired': 'Contact person is required',
      'form.contactPersonMaxLength': 'Contact person name cannot exceed 100 characters',
      'form.email': 'Email',
      'form.emailRequired': 'Email is required',
      'form.emailInvalid': 'Please enter a valid email',
      'form.emailMaxLength': 'Email cannot exceed 100 characters',
      'form.boothNumber': 'Booth Number',
      'form.boothNumberRequired': 'Booth number is required',
      'form.floorNumber': 'Floor Number',
      'form.floorNumberRequired': 'Floor number is required',
      'form.companyLogo': 'Company Logo',
      'form.status': 'Status',
      'form.statusRequired': 'Status is required',
      'form.productIds': 'Product IDs',
      'form.productIdsPlaceholder': 'Enter product IDs (comma-separated)',
      
      // Product Form
      'form.addProduct': 'Add Product',
      'form.editProduct': 'Edit Product',
      'form.updateProduct': 'Update Product',
      'form.productName': 'Product Name',
      'form.productNameRequired': 'Product name is required',
      'form.productNameMaxLength': 'Product name cannot exceed 100 characters',
      'form.description': 'Description',
      'form.descriptionRequired': 'Description is required',
      'form.category': 'Category',
      'form.categoryMaxLength': 'Category cannot exceed 50 characters',
      'form.exhibitor': 'Exhibitor',
      'form.selectExhibitor': 'Select exhibitor',
      'form.exhibitorRequired': 'Please select an exhibitor',
      'form.productImage': 'Product Image',
      
      // Sponsor Form
      'form.addSponsor': 'Add Sponsor',
      'form.editSponsor': 'Edit Sponsor',
      'form.updateSponsor': 'Update Sponsor',
      'form.createSponsor': 'Create Sponsor',
      'form.sponsorName': 'Sponsor Name',
      'form.sponsorNameRequired': 'Sponsor name is required',
      'form.sponsorNameMaxLength': 'Sponsor name cannot exceed 100 characters',
      'form.contributionAmount': 'Contribution Amount',
      'form.contributionAmountRequired': 'Contribution amount is required',
      'form.contributionAmountPositive': 'Contribution amount must be positive',
      'form.benefits': 'Benefits',
      'form.benefitsPlaceholder': 'Enter sponsor benefits (optional)',
      'form.logoUrl': 'Logo URL',
      'form.logoUrlPlaceholder': 'Enter logo URL (optional)',
      
      // Partner Form
      'form.addPartner': 'Add Partner',
      'form.editPartner': 'Edit Partner',
      'form.updatePartner': 'Update Partner',
      'form.partnerName': 'Partner Name',
      'form.partnerNameRequired': 'Partner name is required',
      'form.partnerNameMaxLength': 'Partner name cannot exceed 100 characters',
      'form.partnershipType': 'Partnership Type',
      'form.partnershipTypeRequired': 'Partnership type is required',
      'form.partnershipTypeMaxLength': 'Partnership type cannot exceed 100 characters',
      'form.partnershipBenefits': 'Enter partnership benefits',
      
      // Speaker Form
      'form.addSpeaker': 'Add Speaker',
      'form.editSpeaker': 'Edit Speaker',
      'form.updateSpeaker': 'Update Speaker',
      'form.speakerName': 'Name',
      'form.speakerNameRequired': 'Name is required',
      'form.speakerNameMaxLength': 'Name cannot exceed 100 characters',
      'form.bio': 'Bio',
      'form.bioPlaceholder': 'Enter speaker bio',
      'form.expertise': 'Expertise',
      'form.expertiseMaxLength': 'Expertise cannot exceed 200 characters',
      'form.expertisePlaceholder': 'Enter expertise',
      'form.phone': 'Phone',
      'form.phoneMaxLength': 'Phone cannot exceed 20 characters',
      'form.phonePlaceholder': 'Enter phone number',
      'form.organization': 'Organization',
      'form.organizationMaxLength': 'Organization cannot exceed 100 characters',
      'form.organizationPlaceholder': 'Enter organization',
      
      // Conference Form
      'form.addConference': 'Add Conference',
      'form.editConference': 'Edit Conference',
      'form.updateConference': 'Update Conference',
      'form.conferenceTitle': 'Conference Title',
      'form.conferenceTitleRequired': 'Title is required',
      'form.conferenceTitleMaxLength': 'Title cannot exceed 200 characters',
      'form.conferenceTitlePlaceholder': 'Enter conference title',
      'form.conferenceDescription': 'Description',
      'form.conferenceDescriptionRequired': 'Description is required',
      'form.conferenceDescriptionPlaceholder': 'Enter conference description',
      'form.date': 'Date',
      'form.dateRequired': 'Date is required',
      'form.datePlaceholder': 'Select date',
      'form.time': 'Time',
      'form.timeRequired': 'Time is required',
      'form.timePlaceholder': 'Select time',
      'form.speaker': 'Speaker',
      'form.speakerRequired': 'Speaker is required',
      'form.speakerPlaceholder': 'Enter speaker name',

      // Database tab - simple UI labels
      'database.users': 'Users',
      'database.id': 'id',
      'database.name': 'name',
      'database.email': 'email',
      'database.role': 'role',
      'database.loadingUsers': 'Loading users...',
      'database.noUsersFound': 'No users found',
      'database.noUsersMessage': 'No registered users in the system',
      'database.failedToLoadUsers': 'Failed to load users',
      'database.exhibitorStatusUpdated': 'Exhibitor status updated',
      'database.attendeeStatusUpdated': 'Attendee status updated',
      'database.exhibitorDeleted': 'Exhibitor deleted',
      'database.attendeeDeleted': 'Attendee deleted',
      'database.failedToDeleteAttendee': 'Failed to delete attendee',
      'database.userUpdated': 'User updated',
      'database.roleAttendee': 'attendee',
      'database.roleExhibitor': 'exhibitor',
      'database.roleAdmin': 'admin',
      'database.roleUser': 'user'
    },
    am: {
      // Landing Page
      'welcome.title': 'ወደ የመደበኛ ማሳያ አስተዳዳሪ ስርዓት እንኳን ደህና መጡ',
      'welcome.subtitle': 'አስደናቂ ምርቶችን ይመልከቱ፣ ከተሳተፎች ጋር ይገናኙ እና የምርምር ስራን በምርኩነቱ ይድረሱ',
      'welcome.register': 'እንደ ተገኝጋጊ ይመዝግቡ',
      'welcome.login': 'ግባ',
      
      // Common
      'common.sponsors': 'የእኛ ስፖንሰሮች',
      'common.exhibitors': 'የተመረጡ ተሳተፎች',
      'common.products': 'የተመረጡ ምርቶች',
      'common.conferences': 'የሚመጡ ኮንፈረንሶች',
      'common.booth': 'የማሳያ ቦታ',
      'common.floor': 'ወለል',
      'common.search': 'ፈልግ',
      'common.searchExhibition': 'መደበኛ ማሳያ ፈልግ',
      'common.searchPlaceholder': 'ተሳተፎች፣ ስፖንሰሮች ወይም አጋሮችን ፈልግ...',
      'common.refresh': 'እንደገና ጫን',
      'common.logout': 'ውጣ',
      'common.loading': 'በመጫን ላይ...',
      'common.noResults': 'ምንም ውጤት አልተገኘም',
      'common.actions': 'ተግባራት',
      
      // Login
      'login.title': 'ግባ',
      'login.email': 'ኢሜይል',
      'login.password': 'የይለፍ ቃል',
      'login.signIn': 'ግባ',
      'login.signingIn': 'በመግባት ላይ...',
      'login.forgotPassword': 'የይለፍ ቃል ረሳሁ?',
      'login.registerAttendee': 'እንደ ተገኝጋጊ ይመዝግቡ',
      'login.registerExhibitor': 'እንደ ተሳተፍ ይመዝግቡ',
      'login.noAccount': 'መለያ የለዎትም?',
      'login.loginSuccess': 'በተሳካ ሁኔታ ገብተዋል!',
      'login.loginFailed': 'መግባት አልተሳካም። ማረጋገጫዎችዎን ያረጋግጡ።',
      'login.fillFields': 'እባክዎ ሁሉንም መስኮቶች ይሙሉ',
      
      // Attendee Dashboard
      'attendee.welcome': 'እንኳን ደህና መጡ',
      'attendee.explore': 'ይስሱ',
      'attendee.profile': 'መገለጫ',
      'attendee.totalExhibitors': 'ጠቅላላ ተሳተፎች',
      'attendee.totalSponsors': 'ጠቅላላ ስፖንሰሮች',
      'attendee.totalPartners': 'ጠቅላላ አጋሮች',
      'attendee.exhibitorsByFloor': 'በወለል ተሳተፎች',
      'attendee.ourSponsors': 'የእኛ ስፖንሰሮች',
      'attendee.ourPartners': 'የእኛ አጋሮች',
      'attendee.quickActions': 'ፈጣን ተግባራት',
      'attendee.viewProducts': 'ምርቶችን ይመልከቱ',
      'attendee.hideProducts': 'ምርቶችን ደብቅ',
      'attendee.noProducts': 'ምንም ምርቶች የሉም',
      'attendee.loadingProducts': 'ምርቶችን በመጫን ላይ...',
      'attendee.exhibitor': 'ተሳተፍ(ዎች)',
      
      // Profile
      'profile.editProfile': 'መገለጫ አስተካክል',
      'profile.changePassword': 'የይለፍ ቃል ለውጥ',
      'profile.personalInfo': 'የግል መረጃ',
      'profile.fullName': 'ሙሉ ስም',
      'profile.email': 'ኢሜይል',
      'profile.phone': 'ስልክ',
      'profile.paymentInformation': 'የክፍያ መረጃ',
      'profile.paymentFee': 'የክፍያ ክፍል',
      'profile.noPaymentInfo': 'የክፍያ መረጃ የለም',
      'profile.notProvided': 'አልተሰጠም',
      'profile.loadingProfile': 'መገለጫ በመጫን ላይ...',
      'profile.changePasswordTitle': 'የይለፍ ቃል ለውጥ',
      'profile.changePasswordDescription': 'ለደህንነት ምክንያቶች እባክዎ ጊዜያዊ የይለፍ ቃልዎን ወደ ደህን በሆነ ይለፍ ቃል ይቀይሩ።',
      'profile.newPassword': 'አዲስ የይለፍ ቃል',
      'profile.confirmPassword': 'የይለፍ ቃል አረጋግጥ',
      'profile.confirmNewPassword': 'አዲሱን የይለፍ ቃል አረጋግጥ',
      'profile.enterNewPassword': 'አዲስ የይለፍ ቃል ያስገቡ',
      'profile.confirmNewPasswordPlaceholder': 'አዲሱን የይለፍ ቃል አረጋግጥ',
      'profile.passwordRequired': 'የይለፍ ቃል ያስፈልጋል',
      'profile.passwordMinLength': 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች ይገኝ',
      'profile.confirmRequired': 'እባክዎ የይለፍ ቃልዎን ያረጋግጡ',
      'profile.passwordsDoNotMatch': 'የይለፍ ቃሎች አይጣጣሙም',
      'profile.passwordsMatch': 'የይለፍ ቃሎች ይጣጣማሉ',
      'profile.changing': 'በማለቅ ላይ...',
      'profile.passwordRequirements': 'የይለፍ ቃል መስፈርቶች፡',
      'profile.reqMinLength': 'ቢያንስ 6 ቁምፊዎች',
      'profile.reqLetter': 'ቢያንስ አንድ ፊደል ይገኝ',
      'profile.reqNumber': 'ቢያንስ አንድ ቁጥር ይገኝ',
      'profile.editProfileTitle': 'መገለጫ አርትዕ',
      'profile.profilePhoto': 'የመገለጫ ፎቶ',
      'profile.companyLogo': 'የኩባንያ ሎጎ',
      'profile.enterFullName': 'ሙሉ ስምዎን ያስገቡ',
      'profile.enterEmail': 'ኢሜይል አድራሻ ያስገቡ',
      'profile.enterPhone': 'ስልክ ቁጥር ያስገቡ',
      'profile.enterCompanyName': 'የኩባንያ ስም ያስገቡ',
      'profile.enterContactPerson': 'የግንኙነት ሰው ስም ያስገቡ',
      'profile.nameRequired': 'ስም ያስፈልጋል',
      'profile.emailRequired': 'ኢሜይል ያስፈልጋል',
      'profile.validEmail': 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ',
      'profile.nameMaxLength': 'ስም 100 ቁምፊዎች መብለጥ አይችልም',
      'profile.emailMaxLength': 'ኢሜይል 100 ቁምፊዎች መብለጥ አይችልም',
      'profile.phoneRequired': 'ስልክ ቁጥር ያስፈልጋል',
      'profile.phoneMaxLength': 'ስልክ ቁጥር 20 ቁምፊዎች መብለጥ አይችልም',
      'profile.companyNameRequired': 'የኩባንያ ስም ያስፈልጋል',
      'profile.contactPersonRequired': 'የግንኙነት ሰው ያስፈልጋል',
      'profile.companyMaxLength': 'የኩባንያ ስም 100 ቁምፊዎች መብለጥ አይችልም',
      'profile.contactMaxLength': 'የግንኙነት ሰው ስም 100 ቁምፊዎች መብለጥ አይችልም',
      'profile.changePasswordSuccess': 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል! አዲሱን የይለፍ ቃል በመጠቀም መግባት ይችላሉ።',
      'profile.changePasswordFailed': 'የይለፍ ቃል ለውጥ አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
      
      // Footer
      'footer.copyright': 'የመደበኛ ማሳያ አስተዳዳሪ ስርዓት። ሁሉም መብቶች የተጠበቁ ናቸው።',
      'footer.contactUs': 'ያግኙን',
      
      // Conference
      'conference.schedule': 'ጊዜ ሰሌዳ',
      'conference.location': 'አካባቢ',
      'conference.speaker': 'አዋላጅ',
      
      // Messages
      'message.loggedOut': 'በተሳካ ሁኔታ ወጥተዋል',
      'message.registerSuccess': 'መዝግብ በተሳካ ሁኔታ',
      
      // Errors
      'error.loadFailed': 'መጫን አልተሳካም',
      'error.noData': 'ምንም መረጃ የለም',
      
      // Contact
      'contact.address': 'ኢትዮጵያ አይቲ ፓርክ, BPO, ወለል 7',
      'contact.addressLine2': '',
      'contact.phone': '+251965586329',
      'contact.email': 'dagimawitkelem129@gmail.com',
      'contact.hours': 'ሰኞ-ዓርብ: 9:00AM - 6:00PM',
      'contact.hoursWeekend': 'እሁድ-ሰኞ: 9:00AM - 12:00AM',
      
      // Forgot Password
      'forgotPassword.title': 'የይለፍ ቃል ረሳሁ?',
      'forgotPassword.description': 'የኢሜይል አድራሻዎን ያስገቡ እና መለያዎን እንረዳዎታለን።',
      'forgotPassword.email': 'የኢሜይል አድራሻ',
      'forgotPassword.emailPlaceholder': 'የኢሜይልዎን ያስገቡ',
      'forgotPassword.emailRequired': 'ኢሜይል ያስፈልጋል',
      'forgotPassword.emailInvalid': 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ',
      'forgotPassword.cancel': 'ተወው',
      'forgotPassword.sending': 'በመላክ ላይ...',
      'forgotPassword.sendReset': 'የመቀየሪያ መመሪያዎችን ላክ',
      'forgotPassword.helpTitle': 'ለተሳተፎች እና ለተገኝጋጊዎች:',
      'forgotPassword.helpText': 'የይለፍ ቃል መቀየሪያ መመሪያዎችን ወደ ኢሜይልዎ እንልካለን።',
      'forgotPassword.success': 'የይለፍ ቃል መቀየሪያ ኢሜይል ወደ {{email}} ተልኳል። እባክዎ አዲሱን የይለፍ ቃል ለማግኘት ኢሜይልዎን ይመልከቱ።',
      'forgotPassword.failed': 'የይለፍ ቃል መቀየሪያ ኢሜይል ላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ ወይም ድጋፍን ያነጋግሩ።',
      'forgotPassword.emailNotFound': 'ኢሜይል አድራሻ በስርዓታችን አልተገኘም። እባክዎ ኢሜይልዎን ይመልከቱ ወይም ድጋፍን ያነጋግሩ።',
      'forgotPassword.error': 'መጠይቅዎን በማቀናበር ላይ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።',
      
      // Admin Dashboard
      'admin.dashboard': 'የአስተዳዳሪ ዳሽቦርድ',
      'admin.users': 'ተጠቃሚዎች',
      'admin.exhibitors': 'ተሳተፎች',
      'admin.sponsors': 'ስፖንሰሮች',
      'admin.partners': 'አጋሮች',
      'admin.products': 'ምርቶች',
      'admin.speakers': 'አዋላጆች',
      'admin.conferences': 'ኮንፈረንሶች',
      'admin.floors': 'ወለሎች',
      'admin.addUser': 'ተጠቃሚ ጨምር',
      'admin.addExhibitor': 'ተሳተፍ ጨምር',
      'admin.addSponsor': 'ስፖንሰር ጨምር',
      'admin.addPartner': 'አጋር ጨምር',
      'admin.addProduct': 'ምርት ጨምር',
      'admin.addSpeaker': 'አዋላጅ ጨምር',
      'admin.addConference': 'ኮንፈረንስ ጨምር',
      'admin.edit': 'አርትዕ',
      'admin.delete': 'ሰርዝ',
      'admin.name': 'ስም',
      'admin.email': 'ኢሜይል',
      'admin.role': 'ሚና',
      'admin.status': 'ሁኔታ',
      'admin.companyName': 'የኩባንያ ስም',
      'admin.boothNumber': 'የማሳያ ቦታ ቁጥር',
      'admin.floorNumber': 'የወለል ቁጥር',
      'admin.contactPerson': 'የግንኙነት ሰው',
      'admin.logoUrl': 'ሎጎ URL',
      'admin.benefits': 'ጥቅሞች',
      'admin.partnershipType': 'የአጋርነት አይነት',
      'admin.productName': 'የምርት ስም',
      'admin.category': 'መደብ',
      'admin.description': 'መግለጫ',
      'admin.imageUrl': 'ምስል URL',
      'admin.title': 'ርዕስ',
      'admin.bio': 'ባዮ',
      'admin.schedule': 'ጊዜ ሰሌዳ',
      'admin.location': 'አካባቢ',
      'admin.active': 'ንቁ',
      'admin.inactive': 'አልተሳካም',
      'admin.requestPayment': 'ክፍያ ጠይቅ',
      'admin.openPaymentLink': 'የክፍያ አገናኝ ክፈት',
      'admin.toggleStatus': 'ሁኔታ ቀይር',
      'admin.attendees': 'ተገኝጋጊዎች',
      'admin.database': 'ዳታቤዝ',
      'admin.dashboardOverview': 'የዳሽቦርድ አጠቃላይ እይታ',
      'admin.welcomeMessage': 'ወደ የመደበኛ ማሳያ አስተዳዳሪ ስርዓት እንኳን ደህና መጡ',
      'admin.totalAttendees': 'ጠቅላላ ተገኝጋጊዎች',
      'admin.totalExhibitors': 'ጠቅላላ ተሳተፎች',
      'admin.totalProducts': 'ጠቅላላ ምርቶች',
      'admin.totalConferences': 'ጠቅላላ ኮንፈረንሶች',
      'admin.totalSpeakers': 'ጠቅላላ አዋላጆች',
      'admin.totalSponsors': 'ጠቅላላ ስፖንሰሮች',
      'admin.totalPartners': 'ጠቅላላ አጋሮች',
      'admin.attendeeManagement': 'የተገኝጋጊ አስተዳደር',
      'admin.exhibitorManagement': 'የተሳተፍ አስተዳደር',
      'admin.sponsorManagement': 'የስፖንሰር አስተዳደር',
      'admin.partnerManagement': 'የአጋር አስተዳደር',
      'admin.productManagement': 'የምርት አስተዳደር',
      'admin.speakerManagement': 'የአዋላጅ አስተዳደር',
      'admin.conferenceManagement': 'የኮንፈረንስ አስተዳደር',
      'admin.noAttendeesFound': 'ምንም ተገኝጋጊ አልተገኘም',
      'admin.attendeesAppearHere': 'ተገኝጋጊዎች ከመመዝገባቸው በኋላ እዚህ ይታያሉ',
      'admin.addFirstExhibitor': 'የመጀመሪያ ተሳተፍዎን ይጨምሩ',
      'admin.noSponsorsFound': 'ምንም ስፖንሰር አልተገኘም',
      'admin.noPartnersFound': 'ምንም አጋር አልተገኘም',
      'admin.noProductsFound': 'ምንም ምርት አልተገኘም',
      'admin.noSpeakersFound': 'ምንም አዋላጅ አልተገኘም',
      'admin.noConferencesFound': 'ምንም ኮንፈረንስ አልተገኘም',
      'admin.addFirstSponsor': 'የመጀመሪያ ስፖንሰርዎን ይጨምሩ',
      'admin.addFirstPartner': 'የመጀመሪያ አጋርዎን ይጨምሩ',
      'admin.addFirstProduct': 'የመጀመሪያ ምርትዎን ይጨምሩ',
      'admin.addFirstSpeaker': 'የመጀመሪያ አዋላጅዎን ይጨምሩ',
      'admin.addFirstConference': 'የመጀመሪያ ኮንፈረንስዎን ይጨምሩ',
      'admin.phone': 'ስልክ',
      'admin.floor': 'ወለል',
      'admin.productIds': 'የምርት መለያዎች',
      'admin.contribution': 'መዋጮ',
      'admin.activate': 'አግብር',
      'admin.deactivate': 'አብስል',
      'admin.date': 'ቀን',
      'admin.time': 'ሰዓት',
      'admin.speaker': 'አዋላጅ',
      'admin.organization': 'ድርጅት',
      'admin.expertise': 'ልዩ ችሎታ',
      'admin.image': 'ምስል',
      'admin.adminUser': 'አስተዳዳሪ',
      
      // Exhibitor Dashboard
      'exhibitor.dashboard': 'የተሳተፍ ዳሽቦርድ',
      'exhibitor.products': 'የእኔ ምርቶች',
      'exhibitor.addProduct': 'ምርት ጨምር',
      'exhibitor.noProducts': 'ምንም ምርቶች የሉም. የመጀመሪያ ምርትዎን ይጨምሩ!',
      'exhibitor.profile': 'መገለጫ',
      'exhibitor.personalInfo': 'የግል መረጃ',
      'exhibitor.fullName': 'ሙሉ ስም',
      'exhibitor.phone': 'ስልክ',
      'exhibitor.company': 'ኩባንያ',
      'exhibitor.booth': 'ማሳያ ቦታ',
      'exhibitor.floor': 'ወለል',
      'exhibitor.changePassword': 'የይለፍ ቃል ለውጥ',
      'exhibitor.editProfile': 'መገለጫ አርትዕ',
      'exhibitor.contactPerson': 'የግንኙነት ሰው',
      'exhibitor.email': 'ኢሜይል',
      'exhibitor.status': 'ሁኔታ',
      'exhibitor.boothInformation': 'የማሳያ ቦታ መረጃ',
      'exhibitor.floorFeatures': 'የወለል ባህሪያት፡',
      'exhibitor.layout': 'አቀማመጥ',
      'exhibitor.available': 'ይገኛል',
      'exhibitor.notAvailable': 'አይገኝም',
      'exhibitor.exhibitorsCount': 'ተሳታፊዎች',
      
      // Attendee - Additional
      'attendee.productName': 'የምርት ስም',
      'attendee.productCategory': 'መደብ',
      'attendee.productDescription': 'መግለጫ',
      'attendee.sponsorBenefits': 'ጥቅሞች',
      'attendee.partnerBenefits': 'ጥቅሞች',
      'attendee.partnershipType': 'የአጋርነት አይነት',
      
      // Common Form
      'form.submit': 'ላክ',
      'form.cancel': 'ተወው',
      'form.save': 'አስቀምጥ',
      'form.close': 'ዝጋ',
      'form.delete': 'ሰርዝ',
      'form.edit': 'አርትዕ',
      'form.add': 'ጨምር',
      'form.required': 'ያስፈልጋል',
      'form.invalid': 'የማይረካ',
      'form.loading': 'በመጫን ላይ...',
      'form.success': 'በተሳካ ሁኔታ',
      'form.error': 'ስህተት',
      
      // User Management
      'userManagement.title': 'የተጠቃሚ አስተዳደር',
      'userManagement.refresh': 'አድስ',
      'userManagement.loadingUsers': 'ተጠቃሚዎችን በመጫን ላይ...',
      'userManagement.noUsersFound': 'ምንም ተጠቃሚ አልተገኘም',
      'userManagement.noUsersMessage': 'በስርዓቱ ውስጥ ምንም የተመዘገቡ ተጠቃሚዎች አልተገኙም',
      'userManagement.id': 'መለያ',
      'userManagement.name': 'ስም',
      'userManagement.email': 'ኢሜይል',
      'userManagement.role': 'ሚና',
      'userManagement.roleExhibitor': 'ተሳተፍ',
      'userManagement.roleAttendee': 'ተገኝጋጊ',
      'userManagement.roleAdmin': 'አስተዳዳሪ',
      'userManagement.roleUser': 'ተጠቃሚ',
      'userManagement.statusActive': 'ንቁ',
      'userManagement.statusInactive': 'አልተሳካም',
      'userManagement.statusSuspended': 'ተቆጥቷል',
      'userManagement.exhibitorId': 'የተሳተፍ መለያ',
      'userManagement.failedToLoadUsers': 'ተጠቃሚዎችን ማምጣት አልተሳካም',
      'userManagement.userIdNotFound': 'የተጠቃሚ መለያ አልተገኘም',
      'userManagement.deleteConfirm': 'እርግጠኛ ነዎት {name}ን ማስወገድ ይፈልጋሉ? ይህ ተግባር ሊመለስ አይችልም።',
      'userManagement.exhibitorDeleted': 'ተሳተፍ በተሳካ ሁኔታ ተሰርዟል',
      'userManagement.attendeeDeleted': 'ተገኝጋጊ በተሳካ ሁኔታ ተሰርዟል',
      'userManagement.failedToDeleteExhibitor': 'ተሳተፍን ማስወገድ አልተሳካም',
      'userManagement.failedToDeleteAttendee': 'ተገኝጋጊን ማስወገድ አልተሳካም',
      'userManagement.adminCannotEdit': 'የአስተዳዳሪ ተጠቃሚዎች ሊቀየሩ አይችሉም',
      'userManagement.userUpdated': 'ተጠቃሚ በተሳካ ሁኔታ ተዘመነ!',
      'userManagement.exhibitorStatusUpdated': 'የተሳተፍ ሁኔታ ወደ {status} ተዘመነ',
      'userManagement.attendeeStatusUpdated': 'የተገኝጋጊ ሁኔታ ወደ {status} ተዘመነ',
      'userManagement.failedToUpdateExhibitor': 'የተሳተፍ ሁኔታን ማዘመን አልተሳካም',
      'userManagement.failedToUpdateAttendee': 'የተገኝጋጊ ሁኔታን ማዘመን አልተሳካም',
      
      // Form Labels and Messages
      'form.addExhibitor': 'ተሳተፍ ጨምር',
      'form.editExhibitor': 'ተሳተፍ አርትዕ',
      'form.updateExhibitor': 'ተሳተፍ አዘምን',
      'form.companyName': 'የኩባንያ ስም',
      'form.companyNameRequired': 'የኩባንያ ስም ያስፈልጋል',
      'form.companyNameMaxLength': 'የኩባንያ ስም 100 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.contactPerson': 'የግንኙነት ሰው',
      'form.contactPersonRequired': 'የግንኙነት ሰው ያስፈልጋል',
      'form.contactPersonMaxLength': 'የግንኙነት ሰው ስም 100 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.email': 'ኢሜይል',
      'form.emailRequired': 'ኢሜይል ያስፈልጋል',
      'form.emailInvalid': 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ',
      'form.emailMaxLength': 'ኢሜይል 100 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.boothNumber': 'የማሳያ ቦታ ቁጥር',
      'form.boothNumberRequired': 'የማሳያ ቦታ ቁጥር ያስፈልጋል',
      'form.floorNumber': 'የወለል ቁጥር',
      'form.floorNumberRequired': 'የወለል ቁጥር ያስፈልጋል',
      'form.companyLogo': 'የኩባንያ ሎጎ',
      'form.status': 'ሁኔታ',
      'form.statusRequired': 'ሁኔታ ያስፈልጋል',
      'form.productIds': 'የምርት መለያዎች',
      'form.productIdsPlaceholder': 'የምርት መለያዎችን ያስገቡ (በኮማ የተለዩ)',
      
      'form.addProduct': 'አዲስ ምርት ጨምር',
      'form.editProduct': 'ምርት አርትዕ',
      'form.updateProduct': 'ምርት አዘምን',
      'form.productName': 'የምርት ስም',
      'form.productNameRequired': 'የምርት ስም ያስፈልጋል',
      'form.productNameMaxLength': 'የምርት ስም 100 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.description': 'መግለጫ',
      'form.descriptionRequired': 'መግለጫ ያስፈልጋል',
      'form.category': 'መደብ',
      'form.categoryMaxLength': 'መደብ 50 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.exhibitor': 'ተሳተፍ',
      'form.selectExhibitor': 'ተሳተፍ ይምረጡ',
      'form.exhibitorRequired': 'እባክዎ ተሳተፍ ይምረጡ',
      'form.productImage': 'የምርት ምስል',
      
      'form.addSponsor': 'አዲስ ስፖንሰር ጨምር',
      'form.editSponsor': 'ስፖንሰር አርትዕ',
      'form.updateSponsor': 'ስፖንሰር አዘምን',
      'form.createSponsor': 'ስፖንሰር ፍጠር',
      'form.sponsorName': 'የስፖንሰር ስም',
      'form.sponsorNameRequired': 'የስፖንሰር ስም ያስፈልጋል',
      'form.sponsorNameMaxLength': 'የስፖንሰር ስም 100 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.contributionAmount': 'የመዋጮ መጠን',
      'form.contributionAmountRequired': 'የመዋጮ መጠን ያስፈልጋል',
      'form.contributionAmountPositive': 'የመዋጮ መጠን አዎንታዊ መሆን አለበት',
      'form.benefits': 'ጥቅሞች',
      'form.benefitsPlaceholder': 'የስፖንሰር ጥቅሞችን ያስገቡ (አማራጭ)',
      'form.logoUrl': 'ሎጎ URL',
      'form.logoUrlPlaceholder': 'ሎጎ URL ያስገቡ (አማራጭ)',
      
      'form.addPartner': 'አዲስ አጋር ጨምር',
      'form.editPartner': 'አጋር አርትዕ',
      'form.updatePartner': 'አጋር አዘምን',
      'form.partnerName': 'የአጋር ስም',
      'form.partnerNameRequired': 'የአጋር ስም ያስፈልጋል',
      'form.partnerNameMaxLength': 'የአጋር ስም 100 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.partnershipType': 'የአጋርነት አይነት',
      'form.partnershipTypeRequired': 'የአጋርነት አይነት ያስፈልጋል',
      'form.partnershipTypeMaxLength': 'የአጋርነት አይነት 100 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.partnershipBenefits': 'የአጋርነት ጥቅሞችን ያስገቡ',
      
      'form.addSpeaker': 'አዲስ አዋላጅ ጨምር',
      'form.editSpeaker': 'አዋላጅ አርትዕ',
      'form.updateSpeaker': 'አዋላጅ አዘምን',
      'form.speakerName': 'ስም',
      'form.speakerNameRequired': 'ስም ያስፈልጋል',
      'form.speakerNameMaxLength': 'ስም 100 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.bio': 'ባዮ',
      'form.bioPlaceholder': 'የአዋላጅ ባዮ ያስገቡ',
      'form.expertise': 'ልዩ ችሎታ',
      'form.expertiseMaxLength': 'ልዩ ችሎታ 200 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.expertisePlaceholder': 'ልዩ ችሎታ ያስገቡ',
      'form.phone': 'ስልክ',
      'form.phoneMaxLength': 'ስልክ 20 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.phonePlaceholder': 'የስልክ ቁጥር ያስገቡ',
      'form.organization': 'ድርጅት',
      'form.organizationMaxLength': 'ድርጅት 100 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.organizationPlaceholder': 'ድርጅት ያስገቡ',
      
      'form.addConference': 'አዲስ ኮንፈረንስ ጨምር',
      'form.editConference': 'ኮንፈረንስ አርትዕ',
      'form.updateConference': 'ኮንፈረንስ አዘምን',
      'form.conferenceTitle': 'የኮንፈረንስ ርዕስ',
      'form.conferenceTitleRequired': 'ርዕስ ያስፈልጋል',
      'form.conferenceTitleMaxLength': 'ርዕስ 200 ቁምፊዎችን ሊያልፍ አይችልም',
      'form.conferenceTitlePlaceholder': 'የኮንፈረንስ ርዕስ ያስገቡ',
      'form.conferenceDescription': 'መግለጫ',
      'form.conferenceDescriptionRequired': 'መግለጫ ያስፈልጋል',
      'form.conferenceDescriptionPlaceholder': 'የኮንፈረንስ መግለጫ ያስገቡ',
      'form.date': 'ቀን',
      'form.dateRequired': 'ቀን ያስፈልጋል',
      'form.datePlaceholder': 'ቀን ይምረጡ',
      'form.time': 'ሰዓት',
      'form.timeRequired': 'ሰዓት ያስፈልጋል',
      'form.timePlaceholder': 'ሰዓት ይምረጡ',
      'form.speaker': 'አዋላጅ',
      'form.speakerRequired': 'አዋላጅ ያስፈልጋል',
      'form.speakerPlaceholder': 'የአዋላጅ ስም ያስገቡ',

      // Database tab - simple UI labels (Amharic)
      'database.users': 'Users',
      'database.id': 'id',
      'database.name': 'name',
      'database.email': 'email',
      'database.role': 'role',
      'database.loadingUsers': 'Loading users...',
      'database.noUsersFound': 'No users found',
      'database.noUsersMessage': 'No registered users in the system',
      'database.failedToLoadUsers': 'Failed to load users',
      'database.exhibitorStatusUpdated': 'Exhibitor status updated',
      'database.attendeeStatusUpdated': 'Attendee status updated',
      'database.exhibitorDeleted': 'Exhibitor deleted',
      'database.attendeeDeleted': 'Attendee deleted',
      'database.failedToDeleteAttendee': 'Failed to delete attendee',
      'database.userUpdated': 'User updated',
      'database.roleAttendee': 'attendee',
      'database.roleExhibitor': 'exhibitor',
      'database.roleAdmin': 'admin',
      'database.roleUser': 'user'
    }
  };

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const savedLanguage = localStorage.getItem(this.LANGUAGE_KEY);
    const browserLanguage = navigator.language.split('-')[0];
    
    // Use saved language, or browser language if supported, or default to English
    const language = savedLanguage || (['en', 'am'].includes(browserLanguage) ? browserLanguage : 'en');
    if (this.translations[language]) {
      this.currentLanguageSubject.next(language);
      // Don't save on initial load if it's just browser detection
      if (savedLanguage) {
        // Already saved, no need to save again
      } else {
        // Save browser preference
        localStorage.setItem(this.LANGUAGE_KEY, language);
      }
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: string, save: boolean = true): void {
    if (this.translations[language]) {
      console.log('Setting language to:', language);
      this.currentLanguageSubject.next(language);
      if (save) {
        localStorage.setItem(this.LANGUAGE_KEY, language);
      }
    } else {
      console.warn('Language not supported:', language);
    }
  }

  translate(key: string, params?: { [key: string]: any }): string {
    const currentLang = this.currentLanguageSubject.value;
    const translations = this.translations[currentLang] || this.translations['en'];
    
    // Try direct key access first (for keys like 'welcome.title')
    let translation: any = translations[key];
    
    // If not found, try nested access
    if (translation === undefined) {
      translation = this.getNestedValue(translations, key);
    }
    
    // Fallback to English if still not found
    if (translation === undefined && currentLang !== 'en') {
      translation = this.translations['en'][key] || this.getNestedValue(this.translations['en'], key);
    }
    
    // Final fallback to the key itself
    if (translation === undefined || translation === null) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    const result = translation as string;
    
    if (params) {
      return this.interpolate(result, params);
    }
    
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    try {
      return path.split('.').reduce((current, prop) => {
        return current && current[prop] !== undefined ? current[prop] : undefined;
      }, obj);
    } catch (error) {
      return undefined;
    }
  }

  private interpolate(str: string, params: { [key: string]: any }): string {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  instant(key: string, params?: { [key: string]: any }): string {
    return this.translate(key, params);
  }
}


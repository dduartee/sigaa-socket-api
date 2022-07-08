import { Account } from 'sigaa-api';
class UserService {
    async info(account: Account) {
        const fullName = await account.getName();
        const profilePictureURL = await account.getProfilePictureURL()
        const emails = await account.getEmails()
        return { fullName, profilePictureURL, emails }
    }
};

export default new UserService()

import { Sigaa, Account } from 'sigaa-api';
class UserService {
    /**
     * Resgata informações do usuario
     * @param account Account
     * @returns [{fullname, profilePictureURL}]
     */
    async info(account: Account) {
        const fullName = await account.getName();
        const profilePictureURL = await account.getProfilePictureURL()
        return { fullName, profilePictureURL }
    }
};

export default new UserService()

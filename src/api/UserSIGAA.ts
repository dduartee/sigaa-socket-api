import { Sigaa, Account } from 'sigaa-api';
import { UserCredentials } from '../controllers/User';
export class UserSIGAA {
    /**
     * Realiza login do usuario na api
     * @param credentials UserCredentials
     * @param baseURL String
     * @returns Account
     */
    async login(credentials: UserCredentials, baseURL: string) {
        const {username, password} = credentials;
        const account = await new Sigaa({url: baseURL}).login(username, password);
        return account;
    }
    /**
     * Resgata informações do usuario
     * @param account Account
     * @returns [{fullname, profilePictureURL}]
     */
    async info(account: Account) {
        const fullName = await account.getName();
        const profilePictureURL = await account.getProfilePictureURL()
        return {fullName, profilePictureURL}
    }
    /**
     * Realiza logoff do usuario na api
     * @param account Account
     * @returns void
     */
    async logoff(account: Account) {
        return await account.logoff()
    }
};

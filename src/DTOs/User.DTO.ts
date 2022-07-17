export interface IUserDTOProps {
  username: string;
  fullName: string;
  emails: string[];
  profilePictureURL: string;
}
export interface IUserDTO {
  toJSON (): IUserDTOProps;
}
export class UserDTO implements IUserDTO {
  constructor (public user: IUserDTOProps) {}

  toJSON (): IUserDTOProps {
    return {
      username: this.user.username,
      fullName: this.user.fullName,
      emails: this.user.emails,
      profilePictureURL: this.user.profilePictureURL
    }
  }
}
const defaultAvatar = 'https://www.petinsurancereview.com/sites/default/files/styles/large/public/default_images/default_pet.jpg?itok=xSpT8Z_k';

class UserPresenter {
  constructor({
    username, name, avatar,
  }) {
    let nameText = username;
    if (name && name.length > 0) {
      nameText += ` (${name})`;
    }

    this.name = nameText;

    this.avatar = avatar && avatar.length > 0 ? avatar : defaultAvatar;
  }
}

export default UserPresenter;

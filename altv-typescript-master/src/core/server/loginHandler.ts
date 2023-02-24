import * as alt from 'alt-server';

interface Account {
    username: string;
    password: string;
}

const accounts: Account[] = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' },
    // add more accounts as needed
];

const loginAttempts = new Map();

alt.onClient('login',(player, username: string, password: string) => {
    const account = accounts.find(acc => acc.username === username && acc.password === password);
    if (account) {
        player.spawn(0, 0, 0);
        alt.log('loginSuccess');
        loginAttempts.delete(player.id);
    } else {
        let attempts = loginAttempts.get(player.id) || 0;
        attempts++;
        if (attempts >= 3) {
            player.kick('Failed to login after 3 attempts.');
            loginAttempts.delete(player.id);
        } else {
            alt.log('loginFail');
            loginAttempts.set(player.id, attempts);
        }
    }
})
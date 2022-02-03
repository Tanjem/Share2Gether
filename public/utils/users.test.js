const expect = require('expect');

const {Users} = require('./users');

describe('Users', () => {

    let users;

    beforeEach(() => {
        users = new Users();
        users.users = [{

            id: "1",
            name: "Jake",
            room: "Fun"

        }, {

            id: "2",
            name: "Tim",
            room: "Fun"

        }, {

            id: "3",
            name: "Lin",
            room: "nice"

        }]
    })


    it('should add new user', () => {
        let users = new Users();
        let user = {
            id: "sdaddas",
            name: "Jake",
            room: "Fun"
        };

        let reUser = users.addUser(user.id, user.name, user.room);

        expect(users.users).toEqual([user]);
    });

    it('should return names for the office fans', () => {
        let userList = users.getUserList('Fun');

        expect(userList).toEqual(['Jake', 'Tim'])
    });

    it('should return names for nice', () => {
        let userList = users.getUserList('nice');

        expect(userList).toEqual(['Lin']);
    });

    it('should find user', () => {
        let userID = '2',
            user = users.getUser(userID);

        expect(user.id).toBe(userID);
    });

    it('should not find user', () => {
        let userID = '2231',
            user = users.getUser(userID);

        expect(user).toBeUndefined;
    });

    it('should remove a user', () => {
        let userID = '1',
            user = users.removeUser(userID);

        expect(user.id).toBe(userID);
        expect(users.users.length).toBe(2);
    });

    it('should not remove a user', () => {
        let userID = '143',
            user = users.removeUser(userID);

        expect(user).toBeUndefined;
        expect(users.users.length).toBe(3);
    })


});
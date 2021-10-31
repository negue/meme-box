import {visitAndSpyConsole} from "../utils/utils";

describe('Offline Mode', () => {
  it('shows "offline mode"', () => {
    visitAndSpyConsole('/', {
      spyLog: false
    });
    cy.contains('You are currently in offline mode.');
  });
})

describe('Connected Mode', () => {
  it('"Connected, but settings yet"-Mode', () => {
    cy.intercept(
      {
        method: 'GET', // Route all GET requests
        url: 'http://localhost:6363/api/actionActivity/current',
      },
      {}
    ).as('actionActivity')

    cy.intercept(
      {
        method: 'GET', // Route all GET requests
        url: 'http://localhost:6363/api/',
      },
      {}
    ).as('state');

    visitAndSpyConsole('/', {
      spyLog: false
    });


    cy.contains('To add media files click on');
    cy.get('@consoleError').should('not.be.called');
  });
})

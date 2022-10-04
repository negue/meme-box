import { visitAndSpyConsole } from "../utils/utils";

describe('Offline Mode', () => {
  it('shows "offline mode"', () => {
    visitAndSpyConsole('/', {
      spyLog: false
    });

    cy.wait(3000);
    cy.contains('You are currently in offline mode.');
  });

  it('can open a markdown tutorial dialog', () => {
    visitAndSpyConsole('/', {
      spyLog: false
    });

    cy.get('[datacy="helpOverviewButton"]').click();
    cy.get('[datacy="getting_started.md"]').click();
    cy.get('h1').contains('1. Choose your Media Folder');
  });
})


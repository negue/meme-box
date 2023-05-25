import {Component} from '@angular/core';

@Component({
  selector: 'app-command-variables-example-list',
  templateUrl: './command-variables-example-list.component.html',
  styleUrls: ['./command-variables-example-list.component.scss']
})
export class CommandVariablesExampleListComponent {

  public examples: {
    title: string,
    variableExample: string,
    resultingValue: string
  }[] = [
    {
      title: 'Twitch Message: Username',
      resultingValue: 'thatn00b__',
      variableExample: '${{byTwitch.payload.userstate.username}}'
    },
    {
      title: 'Twitch Message: Message',
      resultingValue: 'Yello all',
      variableExample: '${{byTwitch.payload.message}}'
    },
    {
      title: 'Twitch Message: First Word of Message',
      resultingValue: 'Yello',
      variableExample: '${{ $split(byTwitch.payload.message, " ")[0] }}'
    },
    {
      title: 'Twitch Raid: Channel that raided you',
      resultingValue: 'thatn00b__',
      variableExample: '${{byTwitch.payload.channel}}'
    },
    {
      title: 'Twitch Raid: Raider Count',
      resultingValue: '1337',
      variableExample: '${{byTwitch.payload.viewers}}'
    }
  ];
}

import {IsSelectedPipe} from './is-selected.pipe';
import {IFilterItem} from "./filter.component";

describe('IsSelectedPipe', () => {
  it('create an instance', () => {
    const pipe = new IsSelectedPipe();
    expect(pipe).toBeTruthy();
  });

  it('check if item is selected', () => {
    const pipe = new IsSelectedPipe();

    const item: IFilterItem = {
      value: '1337',
      type: 'ANY',
      icon: '',
      label: ''
    };

    const items: IFilterItem[] = [{
      value: '1337',
      type: 'ANY',
      icon: '',
      label: ''
    }, {
      value: '133B',
      type: 'ANY_OTHER',
      icon: '',
      label: ''
    }];

    expect(pipe.transform(item, items)).toBe(true);
  });
});

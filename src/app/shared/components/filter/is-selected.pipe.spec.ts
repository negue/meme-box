import {IsSelectedPipe} from './is-selected.pipe';
import {FilterTypes, IFilterItem} from "./filter.component";

describe('IsSelectedPipe', () => {
  it('create an instance', () => {
    const pipe = new IsSelectedPipe();
    expect(pipe).toBeTruthy();
  });

  it('check if item is selected', () => {
    const pipe = new IsSelectedPipe();

    const item: IFilterItem = {
      value: '1337',
      type: FilterTypes.Tags,
      icon: '',
      label: ''
    };

    const items: IFilterItem[] = [{
      value: '1337',
      type: FilterTypes.Tags,
      icon: '',
      label: ''
    }, {
      value: '133B',
      type: FilterTypes.ActionTypes,
      icon: '',
      label: ''
    }];

    expect(pipe.transform(item, items)).toBe(true);
  });
});

import {Meta, moduleMetadata, Story} from '@storybook/angular';

import {StepperContentComponent} from './stepper-content.component';
import {STEPPER_CONTENT_MODULES} from "@memebox/ui-components";

export default {
  title: 'UI-Components/Stepper-Content',
  component: StepperContentComponent,
  decorators: [
    moduleMetadata({
      declarations: [StepperContentComponent],
      imports: STEPPER_CONTENT_MODULES
    })
  ],
} as Meta;

const Template: Story<StepperContentComponent> = (args: StepperContentComponent) => ({
  props: args,
});

export const FirstExample = Template.bind({});
FirstExample.args = {
  user: {},
};

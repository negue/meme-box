import {Meta, moduleMetadata, Story} from '@storybook/angular';

import {StepperContentComponent} from './stepper-content.component';
import {StepperContentModuleConfig} from "@memebox/ui-components";

export default {
  title: 'UI-Components/Stepper-Content',
  component: StepperContentComponent,
  decorators: [
    moduleMetadata(StepperContentModuleConfig)
  ],
} as Meta;

const Template: Story<StepperContentComponent> = (args: StepperContentComponent) => ({
  props: args,
});

export const FirstExample = Template.bind({});
FirstExample.args = {
  user: {},
};

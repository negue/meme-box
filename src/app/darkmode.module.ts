import { NgModule } from "@angular/core";
import { MaterialCssVarsModule, MaterialCssVarsService } from "angular-material-css-vars";


export const StyleguideColors = {
  // var(--palette-background-background)
  background: '#2f3640',
  foreground: '#ffffff',
  primary: '#4bcffa',
  // mat-css-color-accent()
  accent: '#575fcf',
  warn: '#f53b57',
  highlight: '#00d8d6', // todo add custom css var
  chipSelected: '#ffd32a'
}

@NgModule({
  providers: [],
  imports: [
    MaterialCssVarsModule.forRoot({
      // all optional
      isAutoContrast: true,
      darkThemeClass: 'isDarkTheme',
      lightThemeClass: 'isLightTheme'
      // ...
    })
  ]
})
export class DarkmodeModule {
  constructor(
    public materialCssVarsService: MaterialCssVarsService
  ) {
    this.materialCssVarsService.setDarkTheme(true);
    this.materialCssVarsService.setAutoContrastEnabled(true)
    this.materialCssVarsService.setPrimaryColor(StyleguideColors.primary);
    this.materialCssVarsService.setAccentColor(StyleguideColors.accent);
    this.materialCssVarsService.setWarnColor(StyleguideColors.warn);
    // TODO still needed?
    // this.materialCssVarsService.setVariable(MaterialCssVariables.ForegroundText, StyleguideColors.foreground);
    // this.materialCssVarsService.setVariable(MaterialCssVariables.ForegroundTextAlpha, '1');
    // this.materialCssVarsService.setVariable(MaterialCssVariables.BackgroundBackground, StyleguideColors.background);
  }
}

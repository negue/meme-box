import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'fontColorContrast'
})
export class FontColorContrastPipe implements PipeTransform {

  transform(backgroundColor: string): unknown {
    if (!backgroundColor) {
      return 'black';
    }

    return getContrastYIQ(backgroundColor);
  }

}

// copied from https://stackoverflow.com/a/11868398
function getContrastYIQ(hexcolor){
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}

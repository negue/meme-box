export function readableSeconds(differenceInSeconds: number): {hour: number;
min: number;
sec: number;
days: number;
string: string;
}  {
  const days = Math.floor(differenceInSeconds / 3600 / 24);
  const hour = Math.floor((differenceInSeconds / 3600) % 24);
  const min = Math.floor((differenceInSeconds / 60) % 60); // maybe?
  const sec = Math.floor(differenceInSeconds % 60); // the rest of the seconds

  const stringValues = [];

  if (days) {
    stringValues.push(`${days}d`);
  }

  if (hour) {
    stringValues.push(`${hour}h`);
  }

  if (min) {
    stringValues.push(`${min}m`);
  }

  stringValues.push(`${sec || '0'}s`);


  const result = {
    hour, min, sec, days,
    string: stringValues.join(':')
  };

  return result;
}

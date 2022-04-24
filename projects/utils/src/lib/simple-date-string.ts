export function simpleDateString(milliseconds = false): string  {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const ml = now.getMilliseconds();

  // YYYY_MM_DD_HH_MM_SS
  const newDateString = `${year}_${month}_${day}__${hour}_${minute}_${second}${milliseconds ? '_'+ml : ''}`;

  return newDateString;
}

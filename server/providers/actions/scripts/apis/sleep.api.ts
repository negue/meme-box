enum SleepTypeEnum {
  MS,
  SECONDS,
  MINUTES
}

export class Sleep {
  public TYPE = SleepTypeEnum;

  for(value: number, type: SleepTypeEnum): Promise<void> {
    switch (type) {
      case SleepTypeEnum.MS:
        return timeoutAsync(value);
      case SleepTypeEnum.SECONDS:
        return timeoutAsync(value * 1000);
      case SleepTypeEnum.MINUTES:
        return timeoutAsync(value * 1000 * 60);
    }
  }

  msAsync(value) {
    return timeoutAsync(value);
  }

  secondsAsync(value) {
    return this.for(value, SleepTypeEnum.SECONDS);
  }
}

export const sleep = new Sleep();

export function timeoutAsync(ms): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

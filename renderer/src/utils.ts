const audioQualityText = (quality: string): string => {
    switch (quality) {
      case ('AUDIO_QUALITY_HIGH'):
        return 'high';
        break;
      case ('AUDIO_QUALITY_MEDIUM'):
        return 'medium';
        break;
      case ('AUDIO_QUALITY_LOW'):
        return 'low';
        break;
      default:
        return 'unknown';
        break;
    }
  }

  const lengthIntoText = (totalSecondsString: string): string => {
    const secondsNumber: number = Number(totalSecondsString);
    const hours: number = Math.floor(secondsNumber / 3600);
    const hoursString: string = ((hours < 10) ? '0' : '') + String(hours);
    const minutes: number = Math.floor((secondsNumber - (hours * 3600)) / 60);
    const minutesString: string = ((minutes < 10) ? '0' : '') + String(minutes);
    const seconds: number = Math.floor(secondsNumber % 60);
    const secondsString: string = ((seconds < 10) ? '0' : '') + String(seconds);
    return `${hoursString}:${minutesString}:${secondsString}`;
  }

  export default {audioQualityText, lengthIntoText};
declare module 'react-native' {
  interface NativeModulesStatic {
    HoraWidgetModule: {
      syncWidget: (
        title: string,
        grahaName: string,
        grahaSymbol: string,
        timeRange: string,
        highlighted: boolean,
        backgroundIcon: string,
        isDarkTheme: boolean
      ) => void;
    };
  }
}

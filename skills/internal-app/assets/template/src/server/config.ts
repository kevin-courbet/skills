import { Config, Context, Layer } from "effect";

const appConfig = Config.all({
  appName: Config.String("APP_NAME").pipe(Config.withDefault("Internal app")),
  locale: Config.String("APP_LOCALE").pipe(Config.withDefault("en-GB")),
  timeZone: Config.String("APP_TIME_ZONE").pipe(Config.withDefault("UTC")),
});

export type AppConfigShape = Config.Success<typeof appConfig>;

export class AppConfig extends Context.Service<AppConfig, AppConfigShape>()("@app/AppConfig") {
  static readonly layer = Layer.effect(AppConfig, appConfig);
}

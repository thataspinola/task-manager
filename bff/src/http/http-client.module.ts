import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        baseURL: configService.getOrThrow<string>('API_BASE_URL'),

        timeout: configService.get<number>('HTTP_TIMEOUT', 5000),

        maxRedirects: 0,

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    }),
  ],

  exports: [HttpModule],
})
export class HttpClientModule {}

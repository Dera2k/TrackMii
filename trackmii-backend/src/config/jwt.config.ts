import { JwtModuleOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

export const getJwtConfig = (
    ConfigService: ConfigService,
): 
JwtModuleOptions => ({
    secret: ConfigService.get('JWT_SECRET'),
    signOptions: {
        expiresIn: ConfigService.get('JWT_EXPIRATION'),
    },
});
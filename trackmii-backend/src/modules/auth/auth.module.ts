import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),

        JwtModule.register({
            secret: process.env.JWT_SECRET || 'super-secret-key',
            signOptions: {
                expiresIn: '7d',
            }
        })
    ],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule {}

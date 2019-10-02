import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserInfo } from './user-entity';

@Entity()
export class RefreshToken {
  public constructor(token: string, userId: string) {
    this.token = token;
    this.userId = userId;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar' })
  public token: string;

  @Column({ type: 'varchar' })
  public userId: string;
}

export class TokensPairDto {
  public token: string;

  public refreshToken: string;
}

export class RefreshReqDto {
  public refreshToken: string;
}

export class LogoutReqDto extends RefreshReqDto {
  public closeAllSessions?: boolean;
}

export class ChangePasswordReqDto {
  public readonly oldPassword: string;

  public readonly newPassword: string;
}

export class SuccessAuthDto extends TokensPairDto {
  public readonly user: UserInfo;
}

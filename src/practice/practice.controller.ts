import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WebrtcGateway } from '../webrtc/webrtc.gateway';
import { UserPreferenceService } from '../user-preference/user-preference.service';
import type { ReqPayload } from 'src/auth/interfaces/req-payload.interface';

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(
    private readonly webrtcGateway: WebrtcGateway,
    private readonly userPreferenceService: UserPreferenceService,
  ) {}

  @Get('online-count')
  getOnlineCount() {
    return {
      count: this.webrtcGateway.getOnlineUsersCount(),
    };
  }

  @Get('check-preferences')
  async checkUserPreferences(@Request() req: ReqPayload) {
    try {
      const preferences = await this.userPreferenceService.findByUserId(
        req.user.sub,
      );
      return {
        hasPreferences: true,
        preferences,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return {
        hasPreferences: false,
        preferences: null,
      };
    }
  }
}

import { Module } from '@nestjs/common';
import { PracticeController } from './practice.controller';
import { WebrtcModule } from '../webrtc/webrtc.module';
import { UserPreferenceModule } from '../user-preference/user-preference.module';

@Module({
  imports: [WebrtcModule, UserPreferenceModule],
  controllers: [PracticeController],
})
export class PracticeModule {}

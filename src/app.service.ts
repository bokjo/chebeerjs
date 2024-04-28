import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getBeer(): string {
    return "🍺";
  }
}

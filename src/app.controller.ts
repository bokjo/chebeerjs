import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("BeerJS")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Get a beer" })
  @Get()
  getBeer(): string {
    return this.appService.getBeer();
  }
}

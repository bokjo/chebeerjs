import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";

export function setupDocs(app: INestApplication<any>) {
  const apiTag = "BeerJS";
  const apiName = `${apiTag} API`;
  const docConfig = new DocumentBuilder()
    .setTitle(apiName)
    .setDescription(apiName)
    .setVersion("42.0.0")
    .setContact("BeerJS", "https://beerjs.mk", "beer@beerjs.mk")
    .setExternalDoc("BeerJS Docs", "https://docs.beerjs.mk")
    // .addServer("http://[::1]", "Cheers")
    // .addServer("http://api.beerjs.mk", "Cheers")
    // .addOAuth2(
    //   {
    //     type: "oauth2",
    //     flows: {
    //       clientCredentials: {
    //         tokenUrl: "https://let.me.in",
    //         scopes: {},
    //       },
    //     },
    //     bearerFormat: "token",
    //     scheme: "bearer",
    //     description: "OAuth2 Authorization",
    //     name: "OAuth2",
    //     in: "header",
    //   },
    //   "OAuth2",
    // )
    .addBasicAuth()
    .addTag(apiTag, apiName)
    .setExternalDoc(`${apiName} Docs`, "https://docs.beerjs.mk/docs")
    .build();

  const swaggerOptionsBase: SwaggerCustomOptions = {
    customfavIcon: "https://beerjs.mk/img/beerjs.skopje-simple.svg",
    customSiteTitle: `${apiName}`,
    explorer: true,
    swaggerOptions: {
      filter: true,
      displayRequestDuration: true,
    },
  };

  const swaggerOptions: SwaggerCustomOptions = {
    ...swaggerOptionsBase,
    // patchDocumentOnRequest: patchDocs("v1"),
  };

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, docConfig, options);

  return {
    document,
    swaggerOptions,
  };
}

import { Controller, Get, Post, HttpStatus, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { InjectClient } from 'nest-mysql';
import { Connection } from 'mysql2';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    @InjectClient() private readonly connection: Connection

    ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @Get('Services')
  async getServices(@Req() request, @Res() response) { 

    const services = await this.connection.query('SELECT * FROM Services');
    const results = Object.assign([{}], services[0]);



    return response.status(HttpStatus.OK).json(results);

  }

  @Get('Schedule')
  async getSchedule(@Req() request, @Res() response) { 

    const schedule = await this.connection.query('SELECT `serviceName`, `datetime`, `gym` FROM `Schedule`, `ScheduleServices`, `Services` WHERE Schedule.scheduleID = ScheduleServices.ScheduleID AND Services.serviceID = ScheduleServices.ServiceID');
    const results = Object.assign([{}], schedule[0]);



    return response.status(HttpStatus.OK).json(results);

  }

  @Post('Register')
  async RegisterNewUser(@Req() request, @Res() response) {

    await this.connection.query(`INSERT INTO Users VALUES (NULL, '${request.body.login}', '${request.body.email}', '${request.body.password}')`);

    return response.status(HttpStatus.OK).json()

  }

  @Post('Login')
  async UserLogin(@Req() request, @Res() response) {


    const users = await this.connection.query(`SELECT * FROM Users  WHERE login="${request.body.login}" AND password="${request.body.password}"`)
    const results = Object.assign([], users[0]);



    return response.status(HttpStatus.OK).json(results)

  }


  @Post('UserSchedule')
  async UserSchedule(@Req() request, @Res() response) {


    const userSchedule = await this.connection.query(`SELECT Users.userID, Services.serviceID, serviceName, login, Price FROM Users, UsersServices, Services WHERE UsersServices.userID = Users.userID AND Services.serviceID = UsersServices.ServiceID AND Users.userID = ${request.body.id}`);
    const results = Object.assign([], userSchedule[0]);


    return response.status(HttpStatus.OK).json(results);

  }

  @Post('getService')
  async getService(@Req() request, @Res() response) {

    await this.connection.query(`INSERT INTO UsersServices VALUES (${request.body.userID}, ${request.body.serviceID})`);

    return response.status(HttpStatus.OK).json();

  }


  @Post('cancelService')
  async cancelService(@Req() request, @Res() response){

    console.log('request.body -> ', request.body);

    await this.connection.query(`DELETE FROM UsersServices WHERE UsersServices.userID = ${request.body.userId} AND UsersServices.ServiceID = ${request.body.serviceId}`);

    return response.status(HttpStatus.OK).json();

  }


}

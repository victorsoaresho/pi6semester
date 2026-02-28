import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { QuotesService } from './quotes.service';
import { RequestQuoteDto } from './dto/request-quote.dto';
import { RespondQuoteDto } from './dto/respond-quote.dto';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('request')
  @Roles('FACTORY')
  @ApiOperation({ summary: 'Solicitar cotações para fornecedores' })
  requestQuotes(
    @CurrentUser('id') factoryId: string,
    @Body() dto: RequestQuoteDto,
  ) {
    return this.quotesService.requestQuotes(factoryId, dto);
  }

  @Get('requests')
  @Roles('FACTORY')
  @ApiOperation({ summary: 'Listar cotações enviadas pela fábrica' })
  findRequests(@CurrentUser('id') factoryId: string) {
    return this.quotesService.findRequests(factoryId);
  }

  @Get('requests/:id')
  @Roles('FACTORY')
  @ApiOperation({ summary: 'Detalhe de uma solicitação de cotação' })
  findRequestById(
    @Param('id') id: string,
    @CurrentUser('id') factoryId: string,
  ) {
    return this.quotesService.findRequestById(id, factoryId);
  }

  @Get('received')
  @Roles('SUPPLIER')
  @ApiOperation({ summary: 'Listar cotações recebidas pelo fornecedor' })
  findReceived(@CurrentUser('id') supplierId: string) {
    return this.quotesService.findReceived(supplierId);
  }

  @Post(':requestId/respond')
  @Roles('SUPPLIER')
  @ApiOperation({ summary: 'Responder uma solicitação de cotação' })
  respond(
    @Param('requestId') requestId: string,
    @CurrentUser('id') supplierId: string,
    @Body() dto: RespondQuoteDto,
  ) {
    return this.quotesService.respond(requestId, supplierId, dto);
  }

  @Patch(':requestId/accept')
  @Roles('FACTORY')
  @ApiOperation({ summary: 'Aceitar uma cotação' })
  accept(
    @Param('requestId') requestId: string,
    @CurrentUser('id') factoryId: string,
  ) {
    return this.quotesService.accept(requestId, factoryId);
  }

  @Patch(':requestId/reject')
  @Roles('FACTORY')
  @ApiOperation({ summary: 'Rejeitar uma cotação' })
  reject(
    @Param('requestId') requestId: string,
    @CurrentUser('id') factoryId: string,
  ) {
    return this.quotesService.reject(requestId, factoryId);
  }

  @Get('compare/:demandId')
  @Roles('FACTORY')
  @ApiOperation({ summary: 'Comparar cotações de uma demanda' })
  compareQuotes(
    @Param('demandId') demandId: string,
    @CurrentUser('id') factoryId: string,
  ) {
    return this.quotesService.compareQuotes(demandId, factoryId);
  }
}

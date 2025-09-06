import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { Order } from '../orders/entities/order.entity';

@Injectable() // Serviço para interagir com Elasticsearch
export class ElasticsearchService {
  async updateOrder(order: Order) {
    await this.client.update({
      index: 'orders',
      id: order.id,
      doc: order,
      doc_as_upsert: true,
    });
  }
  private client: Client;

  constructor() {
    this.client = new Client({ node: process.env.ELASTICSEARCH_NODE });
  }

  async indexOrder(order: Order) {
    await this.client.index({
      index: 'orders',
      id: order.id,
      document: order,
    });
  }

  async searchOrders(filters: any) {
    // Monta query dinâmica para Elasticsearch
    const must: any[] = [];
    if (filters.term) {
      must.push({
        multi_match: {
          query: filters.term,
          fields: ['id', 'status', 'items.productId'],
        },
      });
    }
    if (filters.status) {
      must.push({ match: { status: filters.status } });
    }
    if (filters.item) {
      must.push({ match: { 'items.productId': filters.item } });
    }
    if (filters.startDate || filters.endDate) {
      const range: any = {};
      if (filters.startDate) range.gte = filters.startDate;
      if (filters.endDate) range.lte = filters.endDate;
      must.push({ range: { createdAt: range } });
    }
    const esQuery = must.length > 0 ? { bool: { must } } : { match_all: {} };
    const { hits } = await this.client.search({
      index: 'orders',
      query: esQuery,
    });
    return hits.hits.map((hit) => hit._source);
  }
}

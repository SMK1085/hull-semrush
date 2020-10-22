import nock from "nock";
import _ from "lodash";
import { asValue, AwilixContainer, createContainer } from "awilix";
import { ContextMock } from "../_helpers/mocks";
import { SyncAgent } from "../../src/core/sync-agent";
import IHullAccountUpdateMessage from "../../src/types/account-update-message";
import { APP_ID, APP_ORG, APP_SECRET } from "../_helpers/constants";
import { random } from "faker";

describe("SyncAgent", () => {
  let ctxMock: ContextMock;
  let container: AwilixContainer;

  beforeEach(() => {
    ctxMock = new ContextMock(
      APP_ID,
      {},
      {
        account_attributes_incoming_backlinks_categories: [],
        account_attributes_incoming_domain_ranks: [],
        account_attributes_incoming_traffic_summary: [],
        account_synchronized_segments_backlinks_categories: [],
        account_synchronized_segments_domain_ranks: [],
        account_synchronized_segments_traffic_summary: [],
      },
    );

    const logger = {
      info: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };

    container = createContainer();
    // Register all defaults, so we can focus on the container setup on the specifics only
    container.register("logger", asValue(logger));
    container.register("hullAppId", asValue(APP_ID));
    container.register("hullAppSecret", asValue(APP_SECRET));
    container.register("hullAppOrganization", asValue(APP_ORG));
    container.register("hullClient", asValue(ctxMock.client));
  });

  afterEach(() => {
    nock.cleanAll();
    container.dispose();
  });

  afterAll(() => {
    nock.restore();
  });

  it("should pass smoke test", () => {
    expect(ctxMock).toBeDefined();
  });

  describe("handle account scenario", () => {
    const scenarios: string[] = [
      "accounts-nomatchany",
      "accounts-backlinks_categories",
      "accounts-traffic_summary",
    ];
    _.forEach(scenarios, (scenarioName) => {
      it(`should process '${scenarioName}' properly`, async () => {
        // Arrange messages
        const segmentIds: string[] = [random.uuid()];
        const messagesSetupFn: (
          segmentIds: string[],
        ) => IHullAccountUpdateMessage[] = require(`../_scenarios/${scenarioName}/messages`)
          .default;
        const messages = messagesSetupFn(segmentIds);

        // Arrange Awilix Container Setup
        const containerSetupFn: (
          container: AwilixContainer,
          segmentIds: string[],
        ) => AwilixContainer = require(`../_scenarios/${scenarioName}/container-setup`)
          .default;
        const scoped = containerSetupFn(container, segmentIds);

        const syncAgent = new SyncAgent(scoped);

        const apiResponseSetupFn: (
          nock: any,
          messages: IHullAccountUpdateMessage[],
        ) => void = require(`../_scenarios/${scenarioName}/api-responses`)
          .default;
        apiResponseSetupFn(nock, messages);

        await syncAgent.sendAccountMessages(
          messages,
          scenarioName.startsWith("batch-"),
        );
        const ctxExpectationsFn: (
          ctx: ContextMock,
          messages: IHullAccountUpdateMessage[],
        ) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`)
          .default;
        ctxExpectationsFn(ctxMock, messages);
        // expect(nock.isDone()).toBe(true);
      });
    });
  });
});

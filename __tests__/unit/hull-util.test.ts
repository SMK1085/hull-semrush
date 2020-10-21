import { ClientMock } from "../_helpers/mocks";
import { HullUtil } from "../../src/utils/hull-util";
import { Schema$MapIncomingResult } from "../../src/core/connector";

describe("HullUtil", () => {
  describe("#constructor", () => {
    it("should initialize readonly fields", () => {
      // Arrange
      const hullClient = new ClientMock();

      // Act
      const util = new HullUtil({ hullClient });

      // Assert
      expect(util.hull).toBeDefined();
    });
  });

  describe("#processIncomingData()", () => {
    it("should call hull.asUser().traits() when receiving scope 'asUser' and operation 'traits'", async () => {
      // Arrange
      const hullClient = new ClientMock();
      const params: Schema$MapIncomingResult[] = [
        {
          ident: {
            email: "test@hull.io",
            external_id: "12345",
          },
          hullOperation: "traits",
          hullOperationParams: [
            {
              "semrush/test": true,
            },
          ] as any[],
          hullScope: "asUser",
        },
      ];
      const util = new HullUtil({ hullClient });

      // Act
      const result = await util.processIncomingData(params);

      // Assert
      expect((hullClient.asUser as any).mock.calls[0]).toEqual([
        params[0].ident,
      ]);
      expect((hullClient.traits as any).mock.calls).toHaveLength(1);
      expect((hullClient.traits as any).mock.calls[0]).toEqual(
        params[0].hullOperationParams,
      );
    });

    it("should call hull.asAccount().traits() when receiving scope 'asAccount' and operation 'traits'", async () => {
      // Arrange
      const hullClient = new ClientMock();
      const params: Schema$MapIncomingResult[] = [
        {
          ident: {
            domain: "hull.io",
            external_id: "acct-12345",
          },
          hullOperation: "traits",
          hullOperationParams: [
            {
              "semrush/test": true,
            },
          ] as any[],
          hullScope: "asAccount",
        },
      ];
      const util = new HullUtil({ hullClient });

      // Act
      const result = await util.processIncomingData(params);

      // Assert
      expect((hullClient.asAccount as any).mock.calls[0]).toEqual([
        params[0].ident,
      ]);
      expect((hullClient.traits as any).mock.calls).toHaveLength(1);
      expect((hullClient.traits as any).mock.calls[0]).toEqual(
        params[0].hullOperationParams,
      );
    });
  });
});

import {
  ProtocolEvent,
  StreamChannel,
  ToolsEventData,
} from '@langchain/langgraph';

export const toolEventsTransformer = () => {
  const channel = new StreamChannel<ToolsEventData>('tools');

  return {
    init: () => ({ tools: channel }),
    process(event: ProtocolEvent) {
      if (event.method == 'tools') {
        const data = event.params.data as ToolsEventData;
        if (data.event == 'tool-started' || data.event == 'tool-finished') {
          channel.push(data);
        }
      }
      return true;
    },
  };
};

# frozen_string_literal: true

require "timeout"

DRAG_GRAB_OFFSET = 5

module EditorV2Helpers
  # Polls until the block is truthy; on timeout it returns nil instead of raising,
  # so pair it with an assertion when a stuck state should fail the test.
  def wait_until(timeout: Capybara.default_max_wait_time)
    Timeout.timeout(timeout) { sleep 0.05 until yield }
  rescue Timeout::Error
    nil
  end

  def click_ignoring_overlap(element)
    page.execute_script('arguments[0].click()', element)
  end

  def find_node_client_id(server_id)
    page.evaluate_script(<<~JS)
      (function() {
        const nodes = window.editorAPI.store.getNodes();
        for (const node of nodes) {
          const sid = window.editorAPI.api.getNodeServerId(node.clientId);
          if (sid === #{server_id}) {
            return node.clientId;
          }
        }
        return null;
      })()
    JS
  end

  def find_node_by_server_id(server_id)
    client_id = find_node_client_id(server_id)
    raise "No client ID found for server ID #{server_id}" if client_id.nil?

    find(".node[data-client-id='#{client_id}']")
  end

  def get_server_id(client_id)
    page.evaluate_script("window.editorAPI.api.getNodeServerId('#{client_id}')")
  end

  def wait_for_editor
    expect(page).to have_css('#nodes-canvas', wait: 5)
    expect(page).to have_css('#connections-canvas', wait: 5)
    expect(page).to have_css('.node', wait: 10)
  end

  def expect_history_count(n)
    expect(page).to have_css('.undo-count', text: /^\(#{n}\/50\)/, wait: 3)
  end

  def visible_node_count
    all('.node').count
  end

  def expect_node_count(expected_count)
    expect(page).to have_css('.node', count: expected_count, wait: 2)
  end

  def connection_count
    page.evaluate_script('window.editorAPI.store.getConnections().length')
  end

  def expect_connection_count(expected_count)
    Timeout.timeout(Capybara.default_max_wait_time) do
      sleep 0.05 until connection_count == expected_count
    end
  rescue Timeout::Error
    nil
  ensure
    expect(connection_count).to eq(expected_count)
  end

  def undo_enabled?
    page.has_button?('↩ Undo', disabled: false, wait: 2)
  end

  def redo_enabled?
    page.has_button?('↪ Redo', disabled: false, wait: 2)
  end

  def click_undo
    find('.btn-undo').click
    expect(page).not_to have_css('.btn-undo.loading', wait: 2)
  end

  def click_redo
    find('.btn-redo').click
    expect(page).not_to have_css('.btn-redo.loading', wait: 2)
  end

  def click_undo_without_waiting
    find('.btn-undo').click
  end

  def click_redo_without_waiting
    find('.btn-redo').click
  end

  def select_node(server_id)
    client_id = find_node_client_id(server_id)
    raise "No client ID found for server ID #{server_id}" if client_id.nil?
    click_ignoring_overlap(find(".node[data-client-id='#{client_id}']"))
    expect(page).to have_css(".node[data-client-id='#{client_id}'].selected", wait: Capybara.default_max_wait_time)
  end

  def delete_selected_node
    selected_client_ids = Array(page.evaluate_script('window.editorAPI.store.getSelectedNodeIds()'))
    server_ids = selected_client_ids.map { |client_id| get_server_id(client_id) }.compact
    click_ignoring_overlap(find('.btn-delete-node'))
    page.accept_confirm
    selected_client_ids.each do |client_id|
      expect(page).to have_no_css(".node[data-client-id='#{client_id}']", wait: 5)
    end
    wait_until { Node.where(id: server_ids).none? } if server_ids.any?
  end

  def create_connection(source_server_id, target_server_id)
    source_client = find_node_client_id(source_server_id)
    target_client = find_node_client_id(target_server_id)

    source_connector = find(".node[data-client-id='#{source_client}'] .node-connector.output")
    target_connector = find(".node[data-client-id='#{target_client}'] .node-connector.input")

    source_connector.drag_to(target_connector)
    expect(page).to have_css(
      "line.connection-line[data-source-id='#{source_client}'][data-target-id='#{target_client}']",
      visible: :all,
      wait: 5
    )
    wait_until { Connection.where(source_node_id: source_server_id, target_node_id: target_server_id).count.positive? }
  end

  def delete_connection(source_server_id, target_server_id)
    source_client = find_node_client_id(source_server_id)
    target_client = find_node_client_id(target_server_id)

    delete_btn = find(
      ".connection-delete-btn[data-source-id='#{source_client}'][data-target-id='#{target_client}']",
      visible: :all
    )
    click_ignoring_overlap(delete_btn)

    expect(page).to have_no_css(
      "line.connection-line[data-source-id='#{source_client}'][data-target-id='#{target_client}']",
      visible: :all,
      wait: 5
    )
    wait_until { Connection.where(source_node_id: source_server_id, target_node_id: target_server_id).count.zero? }
  end

  # Useful when server ID changes after undo/redo
  def find_node_by_properties(bot:, node_type:, position_x:, position_y:, data: {})
    Node.where(bot: bot, node_type: node_type, position_x: position_x, position_y: position_y)
        .detect { |n| data.all? { |k, v| n.data[k] == v } }
  end

  def get_editor_state
    page.evaluate_script('window.editorAPI.store.getState()')
  end

  def editor_api_available?
    page.evaluate_script('typeof window.editorAPI !== "undefined"')
  end

  def go_offline
    page.execute_script(<<~JS)
      window.__originalFetch = window.fetch;
      window.fetch = () => Promise.reject(new TypeError('Network error'));
    JS
  end

  def go_online
    page.execute_script('window.fetch = window.__originalFetch;')
  end

  def drag_node_with_descendants(server_id, new_x, new_y)
    client_id = find_node_client_id(server_id)

    current = node_position(client_id)
    current_x = current['x']
    current_y = current['y']
    start = graph_to_client_coordinates(current_x + DRAG_GRAB_OFFSET, current_y + DRAG_GRAB_OFFSET)
    finish = graph_to_client_coordinates(new_x + DRAG_GRAB_OFFSET, new_y + DRAG_GRAB_OFFSET)

    page.execute_script(<<~JS)
      (function() {
        const el = document.querySelector('[data-client-id="#{client_id}"]');
        el.dispatchEvent(new PointerEvent('pointerdown', {
          clientX: #{start['x']},
          clientY: #{start['y']},
          button: 0,
          pointerId: 1,
          isPrimary: true,
          pointerType: 'mouse',
          bubbles: true
        }));
      })();
    JS

    page.execute_script(<<~JS)
      (function() {
        document.dispatchEvent(new PointerEvent('pointermove', {
          clientX: #{finish['x']},
          clientY: #{finish['y']},
          pointerId: 1,
          isPrimary: true,
          pointerType: 'mouse',
          bubbles: true
        }));
      })();
    JS

    page.execute_script(<<~JS)
      (function() {
        document.dispatchEvent(new PointerEvent('pointerup', {
          clientX: #{finish['x']},
          clientY: #{finish['y']},
          pointerId: 1,
          isPrimary: true,
          pointerType: 'mouse',
          bubbles: true
        }));
      })();
    JS

    wait_until { at_position?(client_id, new_x, new_y) }
  end

  def drag_single_node(server_id, new_x, new_y)
    client_id = find_node_client_id(server_id)

    current = node_position(client_id)
    current_x = current['x']
    current_y = current['y']
    start = graph_to_client_coordinates(current_x + DRAG_GRAB_OFFSET, current_y + DRAG_GRAB_OFFSET)
    finish = graph_to_client_coordinates(new_x + DRAG_GRAB_OFFSET, new_y + DRAG_GRAB_OFFSET)

    page.execute_script(<<~JS)
      (function() {
        const el = document.querySelector('[data-client-id="#{client_id}"]');
        el.dispatchEvent(new PointerEvent('pointerdown', {
          clientX: #{start['x']},
          clientY: #{start['y']},
          button: 0,
          shiftKey: true,
          pointerId: 1,
          isPrimary: true,
          pointerType: 'mouse',
          bubbles: true
        }));
      })();
    JS

    page.execute_script(<<~JS)
      (function() {
        document.dispatchEvent(new PointerEvent('pointermove', {
          clientX: #{finish['x']},
          clientY: #{finish['y']},
          pointerId: 1,
          isPrimary: true,
          pointerType: 'mouse',
          bubbles: true
        }));
      })();
    JS

    page.execute_script(<<~JS)
      (function() {
        document.dispatchEvent(new PointerEvent('pointerup', {
          clientX: #{finish['x']},
          clientY: #{finish['y']},
          pointerId: 1,
          isPrimary: true,
          pointerType: 'mouse',
          bubbles: true
        }));
      })();
    JS

    wait_until { at_position?(client_id, new_x, new_y) }
  end

  def node_position(client_id)
    page.evaluate_script("(function(){const n=window.editorAPI.store.getNode('#{client_id}');return n?{x:n.position.x,y:n.position.y}:null;})()")
  end

  def at_position?(client_id, x, y)
    pos = node_position(client_id)
    pos && (pos['x'].to_f - x).abs <= 0.5 && (pos['y'].to_f - y).abs <= 0.5
  end

  def expect_node_position(server_id, expected_x, expected_y)
    client_id = find_node_client_id(server_id)
    wait_until { at_position?(client_id, expected_x, expected_y) }
    actual = node_position(client_id)
    expect(actual['x']).to be_within(0.5).of(expected_x)
    expect(actual['y']).to be_within(0.5).of(expected_y)
  end
end

def graph_to_client_coordinates(graph_x, graph_y)
  page.evaluate_script(<<~JS)
    (function() {
      const viewport = window.editorAPI.canvasViewport;
      const workspace = document.getElementById('canvas-workspace');
      const workspaceRect = workspace.getBoundingClientRect();
      const scenePoint = viewport.graphToScenePoint(#{graph_x}, #{graph_y});
      const zoom = viewport.getZoom();

      return {
        x: workspaceRect.left + (scenePoint.x * zoom),
        y: workspaceRect.top + (scenePoint.y * zoom)
      };
    })();
  JS
end

/**
 * 飞书机器人回调处理 - Vercel 部署版本
 * 处理卡片交互事件，回复用户消息
 */

module.exports = async (req, res) => {
  // 只处理 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    
    // ============================================
    // 1. URL 验证挑战响应 (首次配置时需要)
    // ============================================
    if (body.challenge) {
      console.log('收到 URL 验证请求，返回 challenge:', body.challenge);
      return res.status(200).json({ challenge: body.challenge });
    }

    // ============================================
    // 2. 处理事件回调
    // ============================================
    const { header, event } = body;
    
    if (!header || !header.event_type) {
      console.log('无效的请求格式:', JSON.stringify(body));
      return res.status(200).json({ code: 0, msg: 'ok' });
    }

    const eventType = header.event_type;
    console.log(`收到事件类型：${eventType}`);

    // ============================================
    // 3. 处理卡片交互事件
    // ============================================
    if (eventType === 'im:card:interactive' || eventType === 'card.action') {
      return await handleCardInteractive(event, res);
    }

    // ============================================
    // 4. 处理其他事件（可选）
    // ============================================
    if (eventType === 'im:message.receive_at_bot' || 
        eventType === 'im:message.p2p_msg') {
      return await handleMessageReceive(event, res);
    }

    // 默认响应
    return res.status(200).json({ code: 0, msg: 'ok' });

  } catch (error) {
    console.error('处理回调出错:', error);
    return res.status(500).json({ 
      code: 500, 
      msg: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * 处理卡片交互事件
 */
async function handleCardInteractive(event, res) {
  const { action, user, message } = event;
  
  console.log('卡片交互详情:', {
    action: action?.tag || action?.value,
    user: user?.open_id,
    message: message?.message_id
  });

  // 获取用户点击的动作值
  const actionValue = action?.value || action?.tag || 'unknown';
  const userId = user?.open_id || user?.user_id;

  // ============================================
  // 根据按钮动作回复不同内容
  // ============================================
  let replyContent = '';

  switch (actionValue) {
    case 'order_inquiry':
    case '订单询价':
      replyContent = createOrderInquiryCard(userId);
      break;
    
    case 'warehouse_address':
    case '海外仓地址':
      replyContent = createWarehouseAddressCard();
      break;
    
    case 'logistics_issue':
    case '物流问题':
      replyContent = createLogisticsIssueCard();
      break;
    
    default:
      replyContent = createDefaultReply(actionValue);
  }

  // ============================================
  // 返回飞书要求的响应格式（包含回复消息）
  // ============================================
  return res.status(200).json({
    code: 0,
    msg: 'success',
    data: {
      response_type: 'reply',
      reply: replyContent
    }
  });
}

/**
 * 处理消息接收事件
 */
async function handleMessageReceive(event, res) {
  console.log('收到消息事件');
  
  // 简单响应，表示已收到
  return res.status(200).json({
    code: 0,
    msg: 'ok'
  });
}

// ============================================
// 回复卡片模板
// ============================================

/**
 * 订单询价回复卡片
 */
function createOrderInquiryCard(userId) {
  return {
    type: 'interactive',
    config: {
      wide_screen_mode: true
    },
    elements: [
      {
        tag: 'markdown',
        content: `## 📦 订单询价\n\n您好！请选择您需要的服务：\n\n**可查询内容：**\n• 运费估算\n• 时效查询\n• 库存查询\n• 出库费用`
      },
      {
        tag: 'div',
        text: {
          type: 'plain_text',
          content: '💡 点击下方按钮开始询价'
        }
      },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: {
              type: 'plain_text',
              content: '🚀 运费估算'
            },
            type: 'primary',
            value: {
              action: 'freight_estimate',
              user_id: userId
            }
          },
          {
            tag: 'button',
            text: {
              type: 'plain_text',
              content: '⏱️ 时效查询'
            },
            type: 'default',
            value: {
              action: 'time_estimate',
              user_id: userId
            }
          }
        ]
      },
      {
        tag: 'hr'
      },
      {
        tag: 'note',
        elements: [
          {
            type: 'plain_text',
            content: '📞 如有其他问题，请联系客服'
          }
        ]
      }
    ]
  };
}

/**
 * 海外仓地址回复卡片
 */
function createWarehouseAddressCard() {
  return {
    type: 'interactive',
    config: {
      wide_screen_mode: true
    },
    elements: [
      {
        tag: 'markdown',
        content: `## 🏭 海外仓地址\n\n**美国仓**\n📍 洛杉矶仓：1234 Warehouse Blvd, Los Angeles, CA 90001\n📍 纽约仓：5678 Storage Ave, New York, NY 10001\n\n**欧洲仓**\n📍 德国仓：Warehouse Str. 1, 20095 Hamburg\n📍 英国仓：Unit 5, London Industrial Park`
      },
      {
        tag: 'div',
        text: {
          type: 'plain_text',
          content: '🕐 仓库工作时间：周一至周五 9:00-18:00'
        }
      }
    ]
  };
}

/**
 * 物流问题回复卡片
 */
function createLogisticsIssueCard() {
  return {
    type: 'interactive',
    config: {
      wide_screen_mode: true
    },
    elements: [
      {
        tag: 'markdown',
        content: `## 🚚 物流问题反馈\n\n请选择您遇到的问题类型：`
      },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: {
              type: 'plain_text',
              content: '📦 包裹延误'
            },
            type: 'default',
            value: { action: 'issue_delay' }
          },
          {
            tag: 'button',
            text: {
              type: 'plain_text',
              content: '🔍 物流追踪'
            },
            type: 'default',
            value: { action: 'issue_tracking' }
          },
          {
            tag: 'button',
            text: {
              type: 'plain_text',
              content: '❌ 包裹损坏'
            },
            type: 'danger',
            value: { action: 'issue_damage' }
          }
        ]
      }
    ]
  };
}

/**
 * 默认回复
 */
function createDefaultReply(actionValue) {
  return {
    type: 'text',
    content: `🤖 收到您的操作：${actionValue}\n\n感谢您的使用！如有任何问题，请联系客服。`
  };
}

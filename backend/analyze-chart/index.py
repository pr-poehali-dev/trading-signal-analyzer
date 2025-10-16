import json
import os
import base64
from typing import Dict, Any
from openai import OpenAI

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Анализирует скриншот графика через GPT-4 Vision для бинарных опционов
    Args: event - dict с httpMethod, body (base64 изображение)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с торговым сигналом ВВЕРХ/ВНИЗ для бинарных опционов
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        body_data = json.loads(body_str)
    except json.JSONDecodeError:
        body_data = {}
    
    image_data = body_data.get('image')
    
    if not image_data:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Image data is required'}),
            'isBase64Encoded': False
        }
    
    try:
        
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'OpenAI API key not configured'}),
                'isBase64Encoded': False
            }
        
        client = OpenAI(api_key=api_key)
        
        prompt = """Проанализируй этот торговый график для бинарных опционов. Ответь СТРОГО в формате JSON:

{
  "signal": "ВВЕРХ" или "ВНИЗ",
  "confidence": число от 0 до 100,
  "timeframe": "1 минута" или "5 минут",
  "expiration": "1-2 минуты" или "5-10 минут",
  "indicators": {
    "trend": "описание тренда и паттернов",
    "momentum": "показатели импульса (RSI, MACD, Stochastic)",
    "volume": "анализ объёмов торгов"
  },
  "analysis": "детальный технический анализ (2-3 предложения)",
  "entry_point": "рекомендация когда входить в сделку"
}

Анализируй:
- Свечные паттерны (Pin Bar, Молот, Поглощение, Дожи)
- Уровни поддержки/сопротивления
- Линии тренда и пробои
- Индикаторы технического анализа
- Momentum и силу движения

Будь точным и конкретным. Указывай реальные значения индикаторов если видны на графике."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_data
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        ai_response = response.choices[0].message.content
        
        ai_response = ai_response.strip()
        if ai_response.startswith('```json'):
            ai_response = ai_response[7:]
        if ai_response.startswith('```'):
            ai_response = ai_response[3:]
        if ai_response.endswith('```'):
            ai_response = ai_response[:-3]
        ai_response = ai_response.strip()
        
        result = json.loads(ai_response)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'AI response parsing error',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Analysis failed',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }
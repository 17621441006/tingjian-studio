"""Parse the built viewer DOM for the lightweight event-handler check."""
from html.parser import HTMLParser
import json
import sys


class Tree(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root = {'tag': 'document', 'attrs': {}, 'text': '', 'children': []}
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = {'tag': tag, 'attrs': dict((k, v or '') for k, v in attrs), 'text': '', 'children': []}
        self.stack[-1]['children'].append(node)
        if tag not in {'meta', 'link', 'img', 'br', 'hr', 'input', 'source', 'wbr'}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index]['tag'] == tag:
                self.stack = self.stack[:index]
                break

    def handle_data(self, data):
        self.stack[-1]['text'] += data


def find(node):
    if node['attrs'].get('id') == 'daan-vr-v2':
        return node
    for child in node['children']:
        found = find(child)
        if found:
            return found


parser = Tree()
with open(sys.argv[1]) as stream:
    parser.feed(stream.read())
print(json.dumps(parser.root))

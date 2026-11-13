import 'package:family_os/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('skeleton app loads', (tester) async {
    await tester.pumpWidget(const FamilyOsApp());
    expect(find.text('Family OS'), findsOneWidget);
    expect(find.byType(Scaffold), findsOneWidget);
  });
}

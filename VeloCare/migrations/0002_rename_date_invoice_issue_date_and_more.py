# Generated by Django 5.1.2 on 2024-10-16 18:23

import datetime
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("VeloCare", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameField(
            model_name="invoice",
            old_name="date",
            new_name="issue_date",
        ),
        migrations.RenameField(
            model_name="invoice",
            old_name="total_price",
            new_name="total_amount",
        ),
        migrations.RemoveField(
            model_name="invoice",
            name="vehicle",
        ),
        migrations.RemoveField(
            model_name="issue",
            name="is_new",
        ),
        migrations.AddField(
            model_name="invoice",
            name="due_date",
            field=models.DateField(default=datetime.date(2024, 10, 31)),
        ),
        migrations.AddField(
            model_name="invoice",
            name="invoice_number",
            field=models.CharField(blank=True, max_length=20, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="invoice",
            name="paid",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="issue",
            name="description",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="issue",
            name="is_repair",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="vehicle",
            name="make",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name="vehicle",
            name="owner",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="vehicle",
            name="year",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="issue",
            name="component",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="VeloCare.component",
            ),
        ),
        migrations.CreateModel(
            name="Service",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("date", models.DateTimeField(auto_now_add=True)),
                ("total_cost", models.DecimalField(decimal_places=2, max_digits=10)),
                ("issues", models.ManyToManyField(to="VeloCare.issue")),
                (
                    "vehicle",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="VeloCare.vehicle",
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="invoice",
            name="service",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="VeloCare.service",
            ),
        ),
    ]
